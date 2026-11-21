/**
 * DataExcel Pro - Chart Studio & Visualizations (Chart.js)
 */

const ChartStudio = {
  activeChartInstance: null,
  dashboardChartInstances: [],

  // Palet Warna Profesional
  palettes: {
    indigo: [
      "#6366f1", "#4f46e5", "#818cf8", "#a5b4fc", "#c7d2fe",
      "#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8"
    ],
    emerald: [
      "#10b981", "#059669", "#34d399", "#6ee7b7", "#047857",
      "#14b8a6", "#2dd4bf", "#5eead4", "#0f766e", "#115e59"
    ],
    sunset: [
      "#f97316", "#ea580c", "#fb923c", "#fdba74", "#ef4444",
      "#dc2626", "#f87171", "#f59e0b", "#d97706", "#b45309"
    ],
    purple: [
      "#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd", "#d946ef",
      "#c026d3", "#e879f9", "#ec4899", "#db2777", "#f472b6"
    ],
    ocean: [
      "#0ea5e9", "#0284c7", "#38bdf8", "#7dd3fc", "#06b6d4",
      "#0891b2", "#22d3ee", "#67e8f9", "#0369a1", "#075985"
    ],
    rainbow: [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
      "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ]
  },

  getColors(paletteName = "indigo", count = 1) {
    const list = this.palettes[paletteName] || this.palettes.indigo;
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(list[i % list.length]);
    }
    return colors;
  },

  // Agregasi Data untuk Sumbu X & Y
  aggregateData(data, xCol, yCol, aggFn = "sum", groupByCol = null, limit = 15, sortBy = "val_desc") {
    if (!data || data.length === 0 || !xCol) return { labels: [], datasets: [] };

    // Kasus 1: Sederhana (Tanpa Group By)
    if (!groupByCol) {
      const groups = {};
      data.forEach(row => {
        const xVal = row[xCol] !== null && row[xCol] !== undefined && row[xCol] !== "" ? String(row[xCol]) : "(Kosong)";
        const yVal = yCol ? Number(row[yCol]) : 1;

        if (!groups[xVal]) {
          groups[xVal] = [];
        }
        if (!isNaN(yVal)) {
          groups[xVal].push(yVal);
        }
      });

      let items = Object.entries(groups).map(([label, vals]) => {
        let value = 0;
        if (vals.length > 0) {
          switch (aggFn) {
            case "sum":
              value = vals.reduce((a, b) => a + b, 0);
              break;
            case "avg":
              value = vals.reduce((a, b) => a + b, 0) / vals.length;
              break;
            case "count":
              value = vals.length;
              break;
            case "min":
              value = Math.min(...vals);
              break;
            case "max":
              value = Math.max(...vals);
              break;
            default:
              value = vals.reduce((a, b) => a + b, 0);
          }
        }
        return { label, value };
      });

      // Sorting
      if (sortBy === "val_desc") {
        items.sort((a, b) => b.value - a.value);
      } else if (sortBy === "val_asc") {
        items.sort((a, b) => a.value - b.value);
      } else if (sortBy === "alpha_asc") {
        items.sort((a, b) => a.label.localeCompare(b.label));
      } else if (sortBy === "alpha_desc") {
        items.sort((a, b) => b.label.localeCompare(a.label));
      }

      // Limit top N
      if (limit > 0 && items.length > limit) {
        items = items.slice(0, limit);
      }

      return {
        labels: items.map(i => i.label),
        values: items.map(i => i.value),
        tableData: items
      };
    }

    // Kasus 2: Multi-Series (Dengan Group By)
    const xLabelsSet = new Set();
    const groupCategoriesSet = new Set();
    const matrix = {};

    data.forEach(row => {
      const xVal = row[xCol] !== null && row[xCol] !== undefined ? String(row[xCol]) : "(Kosong)";
      const gVal = row[groupByCol] !== null && row[groupByCol] !== undefined ? String(row[groupByCol]) : "(Lainnya)";
      const yVal = yCol ? Number(row[yCol]) : 1;

      xLabelsSet.add(xVal);
      groupCategoriesSet.add(gVal);

      const key = `${xVal}:::${gVal}`;
      if (!matrix[key]) matrix[key] = [];
      if (!isNaN(yVal)) matrix[key].push(yVal);
    });

    const labels = Array.from(xLabelsSet).slice(0, limit > 0 ? limit : undefined);
    const groups = Array.from(groupCategoriesSet).slice(0, 10); // Maks 10 kategori kelompok

    const calcVal = (vals) => {
      if (!vals || vals.length === 0) return 0;
      switch (aggFn) {
        case "sum": return vals.reduce((a, b) => a + b, 0);
        case "avg": return vals.reduce((a, b) => a + b, 0) / vals.length;
        case "count": return vals.length;
        case "min": return Math.min(...vals);
        case "max": return Math.max(...vals);
        default: return vals.reduce((a, b) => a + b, 0);
      }
    };

    return {
      labels,
      groups,
      getVal: (x, g) => calcVal(matrix[`${x}:::${g}`] || [])
    };
  },

  // Render Grafik Utama di Studio
  renderStudioChart(canvasId, options) {
    const {
      type = "bar",
      data,
      xCol,
      yCol,
      aggFn = "sum",
      groupByCol = null,
      palette = "indigo",
      limit = 15,
      sortBy = "val_desc",
      showLegend = true,
      chartTitle = ""
    } = options;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.activeChartInstance) {
      this.activeChartInstance.destroy();
    }

    const processed = this.aggregateData(data, xCol, yCol, aggFn, groupByCol, limit, sortBy);

    let chartType = type;
    let chartConfig = {};

    if (!groupByCol) {
      const colors = this.getColors(palette, processed.labels.length);

      let datasets = [];

      if (type === "scatter") {
        // Scatter khusus: pasangan X numerik dan Y numerik
        const scatterPoints = data
          .map(r => ({ x: Number(r[xCol]), y: Number(r[yCol]) }))
          .filter(p => !isNaN(p.x) && !isNaN(p.y));

        datasets = [{
          label: `${xCol} vs ${yCol}`,
          data: scatterPoints,
          backgroundColor: colors[0],
          borderColor: colors[1] || colors[0],
          pointRadius: 5
        }];
        chartType = "scatter";
      } else if (type === "line" || type === "area") {
        chartType = "line";
        datasets = [{
          label: `${aggFn.toUpperCase()} dari ${yCol || "Jumlah Baris"}`,
          data: processed.values,
          borderColor: colors[0],
          backgroundColor: type === "area" ? colors[0] + "33" : colors[0],
          fill: type === "area",
          tension: 0.3,
          pointRadius: 4
        }];
      } else if (type === "pie" || type === "doughnut" || type === "polarArea") {
        datasets = [{
          data: processed.values,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2
        }];
      } else if (type === "horizontalBar") {
        chartType = "bar";
        datasets = [{
          label: `${aggFn.toUpperCase()} dari ${yCol || "Jumlah Baris"}`,
          data: processed.values,
          backgroundColor: colors,
          borderRadius: 6
        }];
      } else {
        // Default Bar
        chartType = "bar";
        datasets = [{
          label: `${aggFn.toUpperCase()} dari ${yCol || "Jumlah Baris"}`,
          data: processed.values,
          backgroundColor: colors,
          borderRadius: 6
        }];
      }

      chartConfig = {
        type: chartType,
        data: {
          labels: type === "scatter" ? [] : processed.labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: type === "horizontalBar" ? "y" : "x",
          plugins: {
            legend: {
              display: (type === "pie" || type === "doughnut" || type === "polarArea") ? showLegend : false,
              position: "right"
            },
            title: {
              display: Boolean(chartTitle),
              text: chartTitle,
              font: { size: 16, weight: "bold" }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let val = context.parsed.y !== undefined ? context.parsed.y : (context.parsed.x !== undefined && type === "horizontalBar" ? context.parsed.x : context.parsed);
                  if (typeof val === "number") {
                    return ` ${context.dataset.label || context.label || ""}: ${val.toLocaleString("id-ID")}`;
                  }
                  return ` ${val}`;
                }
              }
            }
          },
          scales: (type === "pie" || type === "doughnut" || type === "polarArea" || type === "radar") ? {} : {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 0 }
            },
            y: {
              grid: { color: "#f3f4f6" },
              ticks: {
                callback: function(value) {
                  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
                  if (value >= 1000) return (value / 1000).toFixed(0) + "K";
                  return value;
                }
              }
            }
          }
        }
      };
    } else {
      // Group By Multi-Dataset
      const colors = this.getColors(palette, processed.groups.length);
      const datasets = processed.groups.map((grpName, idx) => {
        const seriesData = processed.labels.map(lbl => processed.getVal(lbl, grpName));
        return {
          label: grpName,
          data: seriesData,
          backgroundColor: colors[idx % colors.length],
          borderColor: colors[idx % colors.length],
          borderRadius: 4
        };
      });

      chartConfig = {
        type: "bar",
        data: {
          labels: processed.labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: "top" },
            title: { display: Boolean(chartTitle), text: chartTitle }
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "#f3f4f6" } }
          }
        }
      };
    }

    this.activeChartInstance = new Chart(ctx, chartConfig);
    return processed;
  },

  // Export Chart sebagai File PNG
  downloadChartImage(canvasId, fileName = "grafik-analisis.png") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Buat background putih sebelum export agar tidak transparan
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const imageURI = tempCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = fileName;
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
