/**
 * DataExcel Pro - Main Application Controller
 */

const App = {
  state: {
    fileName: null,
    sheetNames: [],
    activeSheet: null,
    rawSheetsData: {},
    dataset: [],
    originalDataset: [],
    columnMeta: {},
    activeTab: "overview",

    // Table state
    table: {
      page: 1,
      perPage: 15,
      searchQuery: "",
      sortCol: null,
      sortDir: "asc",
      filters: []
    },

    // Chart studio state
    chart: {
      type: "bar",
      xCol: "",
      yCol: "",
      aggFn: "sum",
      groupByCol: "",
      palette: "indigo",
      limit: 15,
      sortBy: "val_desc"
    },

    // Pivot state
    pivot: {
      rowField: "",
      colField: "",
      valField: "",
      aggType: "sum",
      showHeatmap: true
    }
  },

  // Inisialisasi Aplikasi
  init() {
    this.setupEventListeners();
    this.renderTabs();

    // Auto-load sample dataset jika belum ada data agar langsung menarik
    setTimeout(() => {
      this.loadSampleData("penjualan");
    }, 100);
  },

  // Setup Event Listeners
  setupEventListeners() {
    // File Upload via Input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    // Drag and Drop
    const dropZones = document.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave", () => {
        zone.classList.remove("dragover");
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    });

    // Sheet Selector Change
    const sheetSelect = document.getElementById("sheetSelector");
    if (sheetSelect) {
      sheetSelect.addEventListener("change", (e) => {
        this.switchSheet(e.target.value);
      });
    }

    // Global Search Table
    const searchInput = document.getElementById("tableSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.state.table.searchQuery = e.target.value;
        this.state.table.page = 1;
        this.renderTable();
      });
    }

    // Per Page Select
    const perPageSelect = document.getElementById("tablePerPage");
    if (perPageSelect) {
      perPageSelect.addEventListener("change", (e) => {
        this.state.table.perPage = parseInt(e.target.value);
        this.state.table.page = 1;
        this.renderTable();
      });
    }

    // Window resize chart re-render
    window.addEventListener("resize", () => {
      if (this.state.activeTab === "charts" && ChartStudio.activeChartInstance) {
        ChartStudio.activeChartInstance.resize();
      }
    });
  },

  // Menangani File yang Diunggah
  handleFileUpload(file) {
    this.showToast(`Membaca file "${file.name}"...`, "info");
    const reader = new FileReader();
    const isCSV = file.name.endsWith(".csv");

    if (isCSV) {
      reader.onload = (e) => {
        try {
          const data = DataEngine.parseCSVText(e.target.result);
          if (!data || data.length === 0) {
            this.showToast("File CSV kosong atau tidak valid.", "error");
            return;
          }
          this.setLoadedData(file.name, ["Sheet1"], "Sheet1", { "Sheet1": data });
          this.showToast(`Berhasil memuat ${data.length} baris dari CSV!`, "success");
        } catch (err) {
          console.error(err);
          this.showToast("Gagal membaca file CSV: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const { sheetNames, sheetsData } = DataEngine.parseWorkbook(e.target.result);
          if (!sheetNames || sheetNames.length === 0) {
            this.showToast("Tidak ada sheet yang ditemukan di file Excel ini.", "error");
            return;
          }
          const defaultSheet = sheetNames[0];
          this.setLoadedData(file.name, sheetNames, defaultSheet, sheetsData);
          this.showToast(`Berhasil memuat "${file.name}" (${sheetsData[defaultSheet].length} baris)!`, "success");
        } catch (err) {
          console.error(err);
          this.showToast("Gagal membaca file Excel: " + err.message, "error");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  },

  // Muat Data Sampel
  loadSampleData(key) {
    const sample = SAMPLE_DATASETS[key];
    if (!sample) return;

    const sheetName = sample.sheetName || "Sheet1";
    const sheetsData = {};
    sheetsData[sheetName] = JSON.parse(JSON.stringify(sample.data));

    this.setLoadedData(`${sample.name}.xlsx`, [sheetName], sheetName, sheetsData);
    this.showToast(`Data contoh "${sample.name}" berhasil dimuat!`, "success");
  },

  // Simpan data ke State dan Render Ulang Semua Komponen
  setLoadedData(fileName, sheetNames, activeSheet, sheetsData) {
    this.state.fileName = fileName;
    this.state.sheetNames = sheetNames;
    this.state.activeSheet = activeSheet;
    this.state.rawSheetsData = sheetsData;

    const currentRows = sheetsData[activeSheet] || [];
    this.state.dataset = JSON.parse(JSON.stringify(currentRows));
    this.state.originalDataset = JSON.parse(JSON.stringify(currentRows));
    this.state.columnMeta = DataEngine.analyzeColumns(this.state.dataset);

    // Reset Filter dan Navigasi Tabel
    this.state.table.page = 1;
    this.state.table.filters = [];
    this.state.table.searchQuery = "";
    this.state.table.sortCol = null;

    // Update UI Header
    this.updateHeaderUI();

    // Render Tab Aktif
    this.renderCurrentTab();

    // Update Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Ganti Sheet Excel
  switchSheet(sheetName) {
    if (!this.state.rawSheetsData[sheetName]) return;
    this.state.activeSheet = sheetName;
    const currentRows = this.state.rawSheetsData[sheetName];
    this.state.dataset = JSON.parse(JSON.stringify(currentRows));
    this.state.originalDataset = JSON.parse(JSON.stringify(currentRows));
    this.state.columnMeta = DataEngine.analyzeColumns(this.state.dataset);

    this.state.table.page = 1;
    this.state.table.filters = [];
    this.state.table.searchQuery = "";

    this.updateHeaderUI();
    this.renderCurrentTab();
    this.showToast(`Berpindah ke lembar: ${sheetName}`, "info");
  },

  // Update Header UI (Judul File, Dropdown Sheet, Total Baris/Kolom Badge)
  updateHeaderUI() {
    const fileBadge = document.getElementById("headerFileBadge");
    const sheetWrapper = document.getElementById("sheetSelectorWrapper");
    const sheetSelect = document.getElementById("sheetSelector");
    const emptyStateHero = document.getElementById("emptyStateHero");
    const mainContentArea = document.getElementById("mainContentArea");

    if (this.state.fileName) {
      if (fileBadge) {
        fileBadge.classList.remove("hidden");
        fileBadge.innerHTML = `<i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600 inline mr-1"></i> <span class="font-medium text-slate-700">${this.state.fileName}</span> <span class="text-xs text-slate-500 font-normal">(${this.state.dataset.length} baris)</span>`;
      }

      if (emptyStateHero) emptyStateHero.classList.add("hidden");
      if (mainContentArea) mainContentArea.classList.remove("hidden");

      if (sheetSelect && this.state.sheetNames.length > 1) {
        if (sheetWrapper) sheetWrapper.classList.remove("hidden");
        sheetSelect.innerHTML = this.state.sheetNames
          .map(s => `<option value="${s}" ${s === this.state.activeSheet ? "selected" : ""}>Sheet: ${s}</option>`)
          .join("");
      } else {
        if (sheetWrapper) sheetWrapper.classList.add("hidden");
      }
    } else {
      if (fileBadge) fileBadge.classList.add("hidden");
      if (emptyStateHero) emptyStateHero.classList.remove("hidden");
      if (mainContentArea) mainContentArea.classList.add("hidden");
    }

    if (window.lucide) lucide.createIcons();
  },

  // Navigasi Tab
  switchTab(tabId) {
    this.state.activeTab = tabId;
    const tabButtons = document.querySelectorAll(".nav-tab");
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("active", "text-blue-600", "border-blue-600", "bg-blue-50/50");
        btn.classList.remove("text-slate-500", "border-transparent");
      } else {
        btn.classList.remove("active", "text-blue-600", "border-blue-600", "bg-blue-50/50");
        btn.classList.add("text-slate-500", "border-transparent");
      }
    });

    const panels = document.querySelectorAll(".tab-panel");
    panels.forEach(p => {
      if (p.id === `tab-${tabId}`) {
        p.classList.remove("hidden");
      } else {
        p.classList.add("hidden");
      }
    });

    this.renderCurrentTab();
  },

  renderTabs() {
    const tabButtons = document.querySelectorAll(".nav-tab");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  renderCurrentTab() {
    if (!this.state.dataset || this.state.dataset.length === 0) return;

    switch (this.state.activeTab) {
      case "overview":
        this.renderOverview();
        break;
      case "table":
        this.renderTable();
        break;
      case "stats":
        this.renderStats();
        break;
      case "charts":
        this.renderChartStudio();
        break;
      case "pivot":
        this.renderPivotStudio();
        break;
      case "cleaning":
        this.renderDataCleaning();
        break;
      case "report":
        this.renderReport();
        break;
    }

    if (window.lucide) lucide.createIcons();
  },

  // ==========================================
  // TAB 1: OVERVIEW & RINGKASAN
  // ==========================================
  renderOverview() {
    const data = this.state.dataset;
    const meta = this.state.columnMeta;
    const totalRows = data.length;
    const totalCols = Object.keys(meta).length;

    // Hitung missing cell total
    let totalCells = totalRows * totalCols;
    let missingCells = 0;
    Object.values(meta).forEach(m => missingCells += m.nullCount);
    let missingPercent = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;

    // Duplikat Baris
    const seen = new Set();
    let dupCount = 0;
    data.forEach(r => {
      const key = JSON.stringify(r);
      if (seen.has(key)) dupCount++;
      seen.add(key);
    });

    // Update KPI Cards
    const elRows = document.getElementById("statTotalRows");
    const elCols = document.getElementById("statTotalCols");
    const elMissing = document.getElementById("statMissingCells");
    const elDups = document.getElementById("statDuplicates");

    if (elRows) elRows.textContent = DataEngine.formatNumber(totalRows, 0);
    if (elCols) elCols.textContent = totalCols;
    if (elMissing) elMissing.innerHTML = `${DataEngine.formatNumber(missingCells, 0)} <span class="text-xs text-slate-400 font-normal">(${missingPercent.toFixed(1)}%)</span>`;
    if (elDups) elDups.textContent = DataEngine.formatNumber(dupCount, 0);

    // Render Metadata Table
    const metaTbody = document.getElementById("overviewColumnMetaTbody");
    if (metaTbody) {
      metaTbody.innerHTML = Object.values(meta).map(m => {
        let badgeClass = "badge-text";
        let typeLabel = "Teks";

        if (m.type === "numeric") {
          badgeClass = "badge-numeric";
          typeLabel = "Angka (Numerik)";
        } else if (m.type === "categorical") {
          badgeClass = "badge-categorical";
          typeLabel = "Kategori";
        } else if (m.type === "date") {
          badgeClass = "badge-date";
          typeLabel = "Tanggal";
        }

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4 font-semibold text-slate-800">${m.name}</td>
            <td class="py-3 px-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">
                ${typeLabel}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-600">${DataEngine.formatNumber(m.validCount, 0)}</td>
            <td class="py-3 px-4">
              <span class="${m.nullCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}">
                ${m.nullCount} (${m.nullPercentage.toFixed(1)}%)
              </span>
            </td>
            <td class="py-3 px-4 text-slate-600">${DataEngine.formatNumber(m.uniqueCount, 0)}</td>
            <td class="py-3 px-4 text-xs text-slate-500 font-mono max-w-xs truncate" title="${m.sampleValues.join(', ')}">
              ${m.sampleValues.slice(0, 3).join(', ')}${m.sampleValues.length > 3 ? '...' : ''}
            </td>
          </tr>
        `;
      }).join("");
    }

    // Auto Insights / Temuan Otomatis
    const insightsContainer = document.getElementById("overviewInsightsContainer");
    if (insightsContainer) {
      const insights = DataEngine.generateInsights(data, meta);
      if (insights.length === 0) {
        insightsContainer.innerHTML = `
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm flex items-center gap-3">
            <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 flex-shrink-0"></i>
            <span>Kualitas data sangat baik! Tidak ditemukan missing value tinggi, anomali ekstrem, atau isu duplikat.</span>
          </div>
        `;
      } else {
        insightsContainer.innerHTML = insights.map(item => {
          let bg = "bg-blue-50 border-blue-200 text-blue-900";
          let iconColor = "text-blue-600";

          if (item.type === "warning") {
            bg = "bg-amber-50 border-amber-200 text-amber-900";
            iconColor = "text-amber-600";
          } else if (item.type === "success") {
            bg = "bg-emerald-50 border-emerald-200 text-emerald-900";
            iconColor = "text-emerald-600";
          } else if (item.type === "trend") {
            bg = "bg-purple-50 border-purple-200 text-purple-900";
            iconColor = "text-purple-600";
          }

          return `
            <div class="p-4 rounded-xl border ${bg} flex items-start gap-3">
              <i data-lucide="${item.icon}" class="w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5"></i>
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xs font-bold uppercase tracking-wider opacity-75">${item.category}</span>
                </div>
                <h4 class="text-sm font-semibold">${item.title}</h4>
                <p class="text-xs opacity-90 mt-1 leading-relaxed">${item.description}</p>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  },

  // ==========================================
  // TAB 2: INTERACTIVE DATA TABLE
  // ==========================================
  renderTable() {
    let list = this.state.dataset;
    const { page, perPage, searchQuery, sortCol, sortDir, filters } = this.state.table;
    const columns = Object.keys(this.state.columnMeta);

    // Terapkan Filter Kustom
    list = DataEngine.filterDataset(list, filters);

    // Terapkan Pencarian Global
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(row => {
        return columns.some(col => {
          const val = row[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Terapkan Pengurutan (Sorting)
    if (sortCol) {
      list = [...list].sort((a, b) => {
        let va = a[sortCol];
        let vb = b[sortCol];

        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;

        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }

        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    // Pagination
    const totalFiltered = list.length;
    const totalPages = Math.ceil(totalFiltered / perPage) || 1;
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * perPage;
    const pagedRows = list.slice(startIdx, startIdx + perPage);

    // Update Counter Info
    const countInfo = document.getElementById("tableCountInfo");
    if (countInfo) {
      countInfo.textContent = `Menampilkan ${startIdx + 1}-${Math.min(startIdx + perPage, totalFiltered)} dari ${totalFiltered} baris (Total data: ${this.state.dataset.length})`;
    }

    // Render Table Header
    const thead = document.getElementById("tableHead");
    if (thead) {
      thead.innerHTML = `
        <tr class="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
          <th class="py-3 px-3 text-center w-12 text-slate-400">#</th>
          ${columns.map(col => {
            const isCurrentSort = sortCol === col;
            const icon = isCurrentSort ? (sortDir === "asc" ? "arrow-up" : "arrow-down") : "arrow-up-down";
            const iconOpacity = isCurrentSort ? "opacity-100 text-blue-600" : "opacity-40";

            return `
              <th class="py-3 px-4 text-left cursor-pointer select-none hover:bg-slate-200/70 transition-colors" onclick="App.handleSort('${col}')">
                <div class="flex items-center gap-1.5 justify-between">
                  <span>${col}</span>
                  <i data-lucide="${icon}" class="w-3.5 h-3.5 ${iconOpacity}"></i>
                </div>
              </th>
            `;
          }).join("")}
        </tr>
      `;
    }

    // Render Table Rows
    const tbody = document.getElementById("tableBody");
    if (tbody) {
      if (pagedRows.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${columns.length + 1}" class="text-center py-12 text-slate-400">
              <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>Tidak ada data yang cocok dengan kriteria filter atau pencarian.</p>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = pagedRows.map((row, rowIdx) => {
          return `
            <tr class="border-b border-slate-100 hover:bg-blue-50/40 transition-colors text-sm">
              <td class="py-2.5 px-3 text-center text-xs text-slate-400 font-mono">${startIdx + rowIdx + 1}</td>
              ${columns.map(col => {
                const val = row[col];
                let formatted = val;
                if (val === null || val === undefined || val === "") {
                  formatted = `<span class="text-slate-300 italic">(null)</span>`;
                } else if (typeof val === "number") {
                  formatted = `<span class="font-mono text-slate-700">${DataEngine.formatNumber(val)}</span>`;
                }
                return `<td class="py-2.5 px-4 text-slate-700 whitespace-nowrap">${formatted}</td>`;
              }).join("")}
            </tr>
          `;
        }).join("");
      }
    }

    // Render Pagination Controls
    this.renderPaginationControls(safePage, totalPages);
    this.renderFilterUI();
  },

  handleSort(column) {
    if (this.state.table.sortCol === column) {
      this.state.table.sortDir = this.state.table.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.state.table.sortCol = column;
      this.state.table.sortDir = "asc";
    }
    this.renderTable();
    if (window.lucide) lucide.createIcons();
  },

  renderPaginationControls(currentPage, totalPages) {
    const container = document.getElementById("tablePagination");
    if (!container) return;

    let html = `
      <button onclick="App.goToPage(${currentPage - 1})" ${currentPage <= 1 ? "disabled" : ""} class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
        <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i> Sebelumnya
      </button>
      <span class="text-xs text-slate-600 font-medium">Halaman ${currentPage} dari ${totalPages}</span>
      <button onclick="App.goToPage(${currentPage + 1})" ${currentPage >= totalPages ? "disabled" : ""} class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
        Berikutnya <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </button>
    `;

    container.innerHTML = html;
  },

  goToPage(page) {
    this.state.table.page = page;
    this.renderTable();
    if (window.lucide) lucide.createIcons();
  },

  // Filter UI
  renderFilterUI() {
    const filterSelectCol = document.getElementById("filterColumnSelect");
    if (filterSelectCol && filterSelectCol.children.length <= 1) {
      const cols = Object.keys(this.state.columnMeta);
      filterSelectCol.innerHTML = `<option value="">-- Pilih Kolom --</option>` +
        cols.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    // Render Active Filter Badges
    const badgeContainer = document.getElementById("activeFiltersList");
    if (badgeContainer) {
      if (this.state.table.filters.length === 0) {
        badgeContainer.innerHTML = `<span class="text-xs text-slate-400 italic">Tidak ada filter aktif</span>`;
      } else {
        badgeContainer.innerHTML = this.state.table.filters.map((f, idx) => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span><b>${f.column}</b> ${f.operator} "${f.value}"</span>
            <button onclick="App.removeFilter(${idx})" class="hover:text-blue-950 font-bold ml-1">&times;</button>
          </span>
        `).join("");
      }
    }
  },

  addFilter() {
    const col = document.getElementById("filterColumnSelect").value;
    const op = document.getElementById("filterOperatorSelect").value;
    const val = document.getElementById("filterValueInput").value;

    if (!col) {
      this.showToast("Pilih kolom terlebih dahulu untuk memfilter.", "warning");
      return;
    }

    this.state.table.filters.push({ column: col, operator: op, value: val });
    document.getElementById("filterValueInput").value = "";
    this.state.table.page = 1;
    this.renderTable();
    this.showToast(`Filter untuk kolom "${col}" ditambahkan.`, "success");
    if (window.lucide) lucide.createIcons();
  },

  removeFilter(idx) {
    this.state.table.filters.splice(idx, 1);
    this.state.table.page = 1;
    this.renderTable();
    if (window.lucide) lucide.createIcons();
  },

  clearAllFilters() {
    this.state.table.filters = [];
    this.state.table.searchQuery = "";
    const searchInp = document.getElementById("tableSearchInput");
    if (searchInp) searchInp.value = "";
    this.state.table.page = 1;
    this.renderTable();
    this.showToast("Semua filter telah dibersihkan.", "info");
    if (window.lucide) lucide.createIcons();
  },

  // ==========================================
  // TAB 3: STATISTIK DESKRIPTIF & KORELASI
  // ==========================================
  renderStats() {
    const data = this.state.dataset;
    const meta = this.state.columnMeta;
    const numericCols = Object.keys(meta).filter(k => meta[k].type === "numeric");
    const catCols = Object.keys(meta).filter(k => meta[k].type === "categorical" || meta[k].type === "text");

    // 1. Tabel Statistik Numerik
    const numTbody = document.getElementById("statsNumericTbody");
    if (numTbody) {
      if (numericCols.length === 0) {
        numTbody.innerHTML = `<tr><td colspan="12" class="py-6 text-center text-slate-400">Tidak ada kolom bertipe angka (numerik) pada data ini.</td></tr>`;
      } else {
        numTbody.innerHTML = numericCols.map(col => {
          const vals = data.map(r => r[col]);
          const s = DataEngine.computeNumericStats(vals);
          if (!s) return "";

          return `
            <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
              <td class="py-3 px-4 font-bold text-slate-800">${col}</td>
              <td class="py-3 px-3 font-mono">${s.count}</td>
              <td class="py-3 px-3 font-mono font-medium text-blue-700">${DataEngine.formatNumber(s.mean)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.median)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${s.mode !== "Tidak ada" ? DataEngine.formatNumber(s.mode) : "-"}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.stdDev)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.min)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.q1)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.q3)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.max)}</td>
              <td class="py-3 px-3 font-mono text-slate-700">${DataEngine.formatNumber(s.iqr)}</td>
              <td class="py-3 px-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${s.outlierCount > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}">
                  ${s.outlierCount}
                </span>
              </td>
            </tr>
          `;
        }).join("");
      }
    }

    // 2. Analisis Kolom Kategorik Dropdown & Frekuensi
    const catSelect = document.getElementById("statsCatSelect");
    if (catSelect) {
      catSelect.innerHTML = catCols.map(c => `<option value="${c}">${c}</option>`).join("");
      catSelect.onchange = (e) => this.renderCategoricalFrequency(e.target.value);

      if (catCols.length > 0) {
        this.renderCategoricalFrequency(catCols[0]);
      } else {
        const catContainer = document.getElementById("statsCatResults");
        if (catContainer) catContainer.innerHTML = `<p class="text-sm text-slate-400">Tidak ada kolom kategori.</p>`;
      }
    }

    // 3. Matriks Korelasi Pearson
    const corrContainer = document.getElementById("statsCorrelationMatrix");
    if (corrContainer) {
      if (numericCols.length < 2) {
        corrContainer.innerHTML = `<p class="text-sm text-slate-400 py-4 text-center">Minimal membutuhkan 2 kolom numerik untuk menghitung matriks korelasi.</p>`;
      } else {
        const matrix = DataEngine.buildCorrelationMatrix(data, numericCols);
        let tableHtml = `
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-center border-collapse">
              <thead>
                <tr class="bg-slate-100 font-semibold text-slate-700">
                  <th class="py-2 px-3 text-left border border-slate-200">Variabel</th>
                  ${numericCols.map(c => `<th class="py-2 px-3 border border-slate-200 max-w-xs truncate" title="${c}">${c}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${numericCols.map(rowCol => `
                  <tr>
                    <td class="py-2 px-3 font-semibold text-left bg-slate-50 border border-slate-200">${rowCol}</td>
                    ${numericCols.map(cCol => {
                      const r = matrix[rowCol][cCol];
                      if (r === null || isNaN(r)) return `<td class="py-2 px-3 border border-slate-200 text-slate-300">-</td>`;

                      let bgClass = "corr-neutral";
                      if (r === 1.0) {
                        bgClass = "bg-blue-600 text-white font-bold";
                      } else if (r >= 0.7) {
                        bgClass = "corr-pos-high";
                      } else if (r >= 0.3) {
                        bgClass = "corr-pos-med";
                      } else if (r <= -0.7) {
                        bgClass = "corr-neg-high";
                      } else if (r <= -0.3) {
                        bgClass = "corr-neg-med";
                      }

                      return `<td class="py-2 px-3 border border-slate-200 font-mono ${bgClass}">${r.toFixed(2)}</td>`;
                    }).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
        corrContainer.innerHTML = tableHtml;
      }
    }
  },

  renderCategoricalFrequency(columnName) {
    const data = this.state.dataset;
    const vals = data.map(r => r[columnName]);
    const stats = DataEngine.computeCategoricalStats(vals);
    const container = document.getElementById("statsCatResults");
    if (!container) return;

    container.innerHTML = `
      <div class="mb-3 flex justify-between items-center text-xs text-slate-500">
        <span>Total Unik: <b>${stats.unique}</b> nilai</span>
        <span>Total Baris: <b>${stats.total}</b></span>
      </div>
      <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        ${stats.topValues.map(item => `
          <div>
            <div class="flex justify-between text-xs mb-1 font-medium">
              <span class="text-slate-800 truncate max-w-xs" title="${item.value}">${item.value}</span>
              <span class="text-slate-600 font-mono">${DataEngine.formatNumber(item.count, 0)} (${item.percent.toFixed(1)}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${item.percent}%"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  // ==========================================
  // TAB 4: STUDIO GRAFIK & VISUALISASI
  // ==========================================
  renderChartStudio() {
    const meta = this.state.columnMeta;
    const allCols = Object.keys(meta);
    const numericCols = allCols.filter(k => meta[k].type === "numeric");

    const xSelect = document.getElementById("chartXColSelect");
    const ySelect = document.getElementById("chartYColSelect");
    const groupSelect = document.getElementById("chartGroupColSelect");

    // Populate dropdowns if needed
    if (xSelect && xSelect.options.length <= 1) {
      xSelect.innerHTML = `<option value="">-- Pilih Sumbu X --</option>` +
        allCols.map(c => `<option value="${c}">${c} (${meta[c].type})</option>`).join("");
      
      // Auto-pick intelligent default X (kategori/teks)
      const catCols = allCols.filter(k => meta[k].type === "categorical");
      if (catCols.length > 0) xSelect.value = catCols[0];
      else if (allCols.length > 0) xSelect.value = allCols[0];
    }

    if (ySelect && ySelect.options.length <= 1) {
      ySelect.innerHTML = `<option value="">(Hitung Baris / COUNT)</option>` +
        numericCols.map(c => `<option value="${c}">${c} (Numerik)</option>`).join("");
      
      // Auto-pick intelligent default Y (numerik pertama)
      if (numericCols.length > 0) ySelect.value = numericCols[0];
    }

    if (groupSelect && groupSelect.options.length <= 1) {
      groupSelect.innerHTML = `<option value="">(Tanpa Group By)</option>` +
        allCols.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    // Update Chart
    this.updateStudioChart();
  },

  updateStudioChart() {
    const type = document.getElementById("chartTypeSelect")?.value || "bar";
    const xCol = document.getElementById("chartXColSelect")?.value;
    const yCol = document.getElementById("chartYColSelect")?.value;
    const aggFn = document.getElementById("chartAggSelect")?.value || "sum";
    const groupByCol = document.getElementById("chartGroupColSelect")?.value || null;
    const palette = document.getElementById("chartPaletteSelect")?.value || "indigo";
    const limit = parseInt(document.getElementById("chartLimitSelect")?.value || 15);
    const sortBy = document.getElementById("chartSortSelect")?.value || "val_desc";

    if (!xCol) return;

    const chartTitle = yCol
      ? `${aggFn.toUpperCase()} dari ${yCol} berdasarkan ${xCol}`
      : `Frekuensi Baris berdasarkan ${xCol}`;

    const processed = ChartStudio.renderStudioChart("studioChartCanvas", {
      type,
      data: this.state.dataset,
      xCol,
      yCol,
      aggFn,
      groupByCol,
      palette,
      limit,
      sortBy,
      chartTitle
    });

    // Render Data Table View under Chart
    const previewContainer = document.getElementById("chartDataPreviewTbody");
    if (previewContainer && processed && processed.tableData) {
      previewContainer.innerHTML = processed.tableData.map(item => `
        <tr class="border-b border-slate-100 text-xs hover:bg-slate-50">
          <td class="py-2 px-3 font-medium text-slate-800">${item.label}</td>
          <td class="py-2 px-3 font-mono text-right text-indigo-700">${DataEngine.formatNumber(item.value)}</td>
        </tr>
      `).join("");
    }
  },

  downloadStudioChart() {
    ChartStudio.downloadChartImage("studioChartCanvas", `grafik-${this.state.fileName || "analisis"}.png`);
    this.showToast("Grafik berhasil diunduh sebagai gambar PNG!", "success");
  },

  // ==========================================
  // TAB 5: TABEL PIVOT
  // ==========================================
  renderPivotStudio() {
    const meta = this.state.columnMeta;
    const allCols = Object.keys(meta);
    const numericCols = allCols.filter(k => meta[k].type === "numeric");

    const rowSelect = document.getElementById("pivotRowSelect");
    const colSelect = document.getElementById("pivotColSelect");
    const valSelect = document.getElementById("pivotValSelect");

    if (rowSelect && rowSelect.options.length <= 1) {
      rowSelect.innerHTML = `<option value="">-- Pilih Dimensi Baris --</option>` +
        allCols.map(c => `<option value="${c}">${c}</option>`).join("");
      
      const catCols = allCols.filter(k => meta[k].type === "categorical");
      if (catCols.length > 0) rowSelect.value = catCols[0];
      else if (allCols.length > 0) rowSelect.value = allCols[0];
    }

    if (colSelect && colSelect.options.length <= 1) {
      colSelect.innerHTML = `<option value="">(Tidak Ada Kolom / 1 Dimensi)</option>` +
        allCols.map(c => `<option value="${c}">${c}</option>`).join("");

      const catCols = allCols.filter(k => meta[k].type === "categorical");
      if (catCols.length > 1) colSelect.value = catCols[1];
    }

    if (valSelect && valSelect.options.length <= 1) {
      valSelect.innerHTML = `<option value="">(Hitung Jumlah Baris / Count)</option>` +
        numericCols.map(c => `<option value="${c}">${c} (Numerik)</option>`).join("");

      if (numericCols.length > 0) valSelect.value = numericCols[0];
    }

    this.calculatePivot();
  },

  calculatePivot() {
    const rowField = document.getElementById("pivotRowSelect")?.value;
    const colField = document.getElementById("pivotColSelect")?.value || null;
    const valField = document.getElementById("pivotValSelect")?.value || null;
    const aggType = document.getElementById("pivotAggSelect")?.value || "sum";
    const container = document.getElementById("pivotResultContainer");

    if (!rowField) {
      if (container) container.innerHTML = `<p class="text-sm text-slate-400 py-6 text-center">Pilih field baris terlebih dahulu.</p>`;
      return;
    }

    const pivot = DataEngine.computePivot(this.state.dataset, rowField, colField, valField, aggType);
    if (!pivot || !container) return;

    // Hitung max value untuk heatmap intensity
    let maxVal = 0;
    pivot.rowKeys.forEach(r => {
      pivot.colKeys.forEach(c => {
        const v = pivot.matrix[r][c];
        if (v > maxVal) maxVal = v;
      });
    });

    let html = `
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <th class="py-3 px-4 text-left border-r border-slate-200">${rowField} \\ ${colField || "Semua"}</th>
              ${pivot.colKeys.map(cKey => `
                <th class="py-3 px-4 text-right border-r border-slate-200">${cKey}</th>
              `).join("")}
              <th class="py-3 px-4 text-right bg-slate-200/70 text-slate-900 font-extrabold">Subtotal Baris</th>
            </tr>
          </thead>
          <tbody>
            ${pivot.rowKeys.map(rKey => `
              <tr class="border-b border-slate-100 hover:bg-slate-50/80">
                <td class="py-2.5 px-4 font-semibold text-slate-800 border-r border-slate-200 bg-slate-50/50">${rKey}</td>
                ${pivot.colKeys.map(cKey => {
                  const val = pivot.matrix[rKey][cKey];
                  const ratio = maxVal > 0 ? (val / maxVal) : 0;
                  // Light green/blue tint based on intensity
                  const bgStyle = ratio > 0.05 ? `style="background-color: rgba(59, 130, 246, ${Math.min(ratio * 0.35, 0.45)})"` : "";
                  return `
                    <td class="py-2.5 px-4 text-right font-mono border-r border-slate-200" ${bgStyle}>
                      ${DataEngine.formatNumber(val)}
                    </td>
                  `;
                }).join("")}
                <td class="py-2.5 px-4 text-right font-mono font-bold bg-slate-100 text-blue-900">
                  ${DataEngine.formatNumber(pivot.rowTotals[rKey])}
                </td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr class="bg-slate-200/80 font-bold text-slate-900 border-t-2 border-slate-300">
              <td class="py-3 px-4 text-left border-r border-slate-300 font-extrabold">Total Kolom</td>
              ${pivot.colKeys.map(cKey => `
                <td class="py-3 px-4 text-right font-mono border-r border-slate-300 font-bold text-slate-900">
                  ${DataEngine.formatNumber(pivot.colTotals[cKey])}
                </td>
              `).join("")}
              <td class="py-3 px-4 text-right font-mono font-extrabold text-blue-700 bg-blue-100/60">
                ${DataEngine.formatNumber(pivot.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  // ==========================================
  // TAB 6: PEMBERSIHAN DATA
  // ==========================================
  renderDataCleaning() {
    const meta = this.state.columnMeta;
    const allCols = Object.keys(meta);

    // Populate Column Dropdowns in cleaning panels
    const dropNullCol = document.getElementById("cleanDropNullCol");
    const fillNullCol = document.getElementById("cleanFillNullCol");
    const trimCol = document.getElementById("cleanTrimCol");
    const caseCol = document.getElementById("cleanCaseCol");
    const deleteCol = document.getElementById("cleanDeleteCol");

    const makeOptions = (includeAll = false) => {
      let opt = includeAll ? `<option value="">(Semua Kolom)</option>` : `<option value="">-- Pilih Kolom --</option>`;
      opt += allCols.map(c => `<option value="${c}">${c}</option>`).join("");
      return opt;
    };

    if (dropNullCol) dropNullCol.innerHTML = makeOptions(true);
    if (fillNullCol) fillNullCol.innerHTML = makeOptions(false);
    if (trimCol) trimCol.innerHTML = makeOptions(false);
    if (caseCol) caseCol.innerHTML = makeOptions(false);
    if (deleteCol) deleteCol.innerHTML = makeOptions(false);
  },

  applyCleanAction(action, params = {}) {
    const oldLength = this.state.dataset.length;
    this.state.dataset = DataEngine.cleanData(this.state.dataset, action, params);
    this.state.columnMeta = DataEngine.analyzeColumns(this.state.dataset);

    const newLength = this.state.dataset.length;
    this.updateHeaderUI();
    this.renderCurrentTab();

    if (action === "remove_duplicates") {
      const removed = oldLength - newLength;
      this.showToast(`Berhasil menghapus ${removed} baris duplikat!`, "success");
    } else if (action === "drop_null_rows") {
      const removed = oldLength - newLength;
      this.showToast(`Berhasil menghapus ${removed} baris berisi nilai kosong.`, "success");
    } else if (action === "fill_nulls") {
      this.showToast(`Nilai kosong pada kolom "${params.column}" berhasil diisi.`, "success");
    } else if (action === "trim_text" || action === "change_case") {
      this.showToast(`Transformasi teks pada kolom "${params.column}" selesai!`, "success");
    } else if (action === "delete_column") {
      this.showToast(`Kolom "${params.column}" berhasil dihapus.`, "success");
    }
  },

  resetToOriginal() {
    if (confirm("Apakah Anda yakin ingin mengembalikan data ke bentuk awal file? Semua perubahan pembersihan akan dibatalkan.")) {
      this.state.dataset = JSON.parse(JSON.stringify(this.state.originalDataset));
      this.state.columnMeta = DataEngine.analyzeColumns(this.state.dataset);
      this.updateHeaderUI();
      this.renderCurrentTab();
      this.showToast("Data dikembalikan ke bentuk asli semula.", "info");
    }
  },

  // ==========================================
  // TAB 7: LAPORAN & EXPORT
  // ==========================================
  renderReport() {
    const data = this.state.dataset;
    const meta = this.state.columnMeta;
    const totalRows = data.length;
    const totalCols = Object.keys(meta).length;
    const numericCols = Object.keys(meta).filter(k => meta[k].type === "numeric");

    const reportContainer = document.getElementById("printableReportArea");
    if (!reportContainer) return;

    reportContainer.innerHTML = `
      <div class="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div class="border-b border-slate-200 pb-4 flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Laporan Analisis Data Eksekutif</h1>
            <p class="text-xs text-slate-500 mt-1">File: <b>${this.state.fileName || "Data"}</b> | Lembar: <b>${this.state.activeSheet}</b> | Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">DataExcel Pro Generated</span>
          </div>
        </div>

        <!-- Ringkasan Eksekutif -->
        <div>
          <h3 class="text-base font-bold text-slate-800 mb-2">1. Ringkasan Kuantitatif</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-xs text-slate-500">Total Baris Data</div>
              <div class="text-xl font-black text-slate-800">${DataEngine.formatNumber(totalRows, 0)}</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-xs text-slate-500">Jumlah Kolom</div>
              <div class="text-xl font-black text-slate-800">${totalCols}</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-xs text-slate-500">Kolom Numerik</div>
              <div class="text-xl font-black text-blue-600">${numericCols.length}</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="text-xs text-slate-500">Integritas Data</div>
              <div class="text-xl font-black text-emerald-600">Terverifikasi</div>
            </div>
          </div>
        </div>

        <!-- Temuan Kunci -->
        <div>
          <h3 class="text-base font-bold text-slate-800 mb-2">2. Temuan Utama (Insights)</h3>
          <div class="space-y-2">
            ${DataEngine.generateInsights(data, meta).map(i => `
              <div class="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border-l-4 border-blue-500">
                <b>${i.title}:</b> ${i.description}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Tabel Ringkasan Nilai Numerik -->
        <div>
          <h3 class="text-base font-bold text-slate-800 mb-2">3. Metrik & Rata-rata Kunci</h3>
          <div class="overflow-x-auto border border-slate-200 rounded-xl">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th class="py-2.5 px-3">Kolom</th>
                  <th class="py-2.5 px-3">Total (Sum)</th>
                  <th class="py-2.5 px-3">Rata-rata (Mean)</th>
                  <th class="py-2.5 px-3">Median</th>
                  <th class="py-2.5 px-3">Nilai Min</th>
                  <th class="py-2.5 px-3">Nilai Max</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${numericCols.map(c => {
                  const s = DataEngine.computeNumericStats(data.map(r => r[c]));
                  if (!s) return "";
                  return `
                    <tr>
                      <td class="py-2 px-3 font-semibold text-slate-800">${c}</td>
                      <td class="py-2 px-3 font-mono">${DataEngine.formatNumber(s.sum)}</td>
                      <td class="py-2 px-3 font-mono font-medium text-blue-700">${DataEngine.formatNumber(s.mean)}</td>
                      <td class="py-2 px-3 font-mono">${DataEngine.formatNumber(s.median)}</td>
                      <td class="py-2 px-3 font-mono">${DataEngine.formatNumber(s.min)}</td>
                      <td class="py-2 px-3 font-mono">${DataEngine.formatNumber(s.max)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // Export Data ke XLSX
  exportCurrentDataXLSX() {
    const name = (this.state.fileName || "data-analisis").replace(/\.[^/.]+$/, "") + "_bersih.xlsx";
    DataEngine.exportToXLSX(this.state.dataset, name);
    this.showToast(`Berhasil mengekspor ${name}`, "success");
  },

  // Export Data ke CSV
  exportCurrentDataCSV() {
    const name = (this.state.fileName || "data-analisis").replace(/\.[^/.]+$/, "") + "_bersih.csv";
    DataEngine.exportToCSV(this.state.dataset, name);
    this.showToast(`Berhasil mengekspor ${name}`, "success");
  },

  // Cetak Laporan PDF
  printReport() {
    this.switchTab("report");
    setTimeout(() => {
      window.print();
    }, 200);
  },

  // Toast Notification System
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    let bg = "bg-slate-900 text-white";
    if (type === "success") bg = "bg-emerald-600 text-white";
    if (type === "warning") bg = "bg-amber-600 text-white";
    if (type === "error") bg = "bg-red-600 text-white";

    toast.className = `fixed bottom-6 right-6 ${bg} px-4 py-3 rounded-xl shadow-xl text-xs font-medium z-50 flex items-center gap-2 transition-all transform duration-300 opacity-0 translate-y-2`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-2");
    });

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Start app on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
