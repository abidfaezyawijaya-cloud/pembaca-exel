/**
 * DataExcel Pro - Data Processing & Analytics Engine
 * Menangani parsing file, tipe data, kalkulasi statistik deskriptif, korelasi, pivot, filter, dan pembersihan data.
 */

const DataEngine = {
  // Format angka Indonesia (titik sebagai pemisah ribuan, koma untuk desimal)
  formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return Number(val).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  },

  formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return "Rp " + Number(val).toLocaleString("id-ID", {
      maximumFractionDigits: 0
    });
  },

  formatPercent(val, decimals = 1) {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return Number(val).toLocaleString("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + "%";
  },

  // Parse Excel ArrayBuffer menggunakan SheetJS (XLSX)
  parseWorkbook(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const sheetNames = workbook.SheetNames;
    const sheetsData = {};

    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      sheetsData[sheetName] = json;
    });

    return {
      workbook,
      sheetNames,
      sheetsData
    };
  },

  // Parse CSV string menggunakan PapaParse
  parseCSVText(csvText) {
    const parsed = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    return parsed.data;
  },

  // Deteksi Tipe Data & Metadata untuk setiap Kolom
  analyzeColumns(data) {
    if (!data || data.length === 0) return {};
    const columns = Object.keys(data[0]);
    const totalRows = data.length;
    const meta = {};

    columns.forEach(col => {
      const values = data.map(row => row[col]);
      const nonNulls = values.filter(v => v !== null && v !== undefined && v !== "");
      const nullCount = totalRows - nonNulls.length;
      const uniqueValues = new Set(nonNulls.map(v => String(v).trim()));

      let type = "text";
      if (nonNulls.length === 0) {
        type = "empty";
      } else {
        const isNumeric = nonNulls.every(v => typeof v === "number" || (!isNaN(v) && v !== "" && typeof v !== "boolean"));
        if (isNumeric) {
          type = "numeric";
        } else {
          const isDate = nonNulls.every(v => v instanceof Date || (!isNaN(Date.parse(v)) && isNaN(v) && String(v).length >= 8));
          if (isDate) {
            type = "date";
          } else {
            const uniqueRatio = uniqueValues.size / nonNulls.length;
            if (uniqueValues.size <= 25 || uniqueRatio < 0.25) {
              type = "categorical";
            } else {
              type = "text";
            }
          }
        }
      }

      meta[col] = {
        name: col,
        type,
        totalCount: totalRows,
        validCount: nonNulls.length,
        nullCount,
        nullPercentage: totalRows > 0 ? (nullCount / totalRows) * 100 : 0,
        uniqueCount: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5)
      };
    });

    return meta;
  },

  // Hitung Statistik Deskriptif Kolom Numerik
  computeNumericStats(values) {
    const nums = values
      .filter(v => v !== null && v !== undefined && v !== "" && !isNaN(v))
      .map(v => Number(v))
      .sort((a, b) => a - b);

    if (nums.length === 0) return null;

    const count = nums.length;
    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    const mean = sum / count;

    // Median
    let median;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = (nums[mid - 1] + nums[mid]) / 2;
    } else {
      median = nums[mid];
    }

    // Min & Max & Range
    const min = nums[0];
    const max = nums[count - 1];
    const range = max - min;

    // Quartiles (Tukey method)
    const getPercentile = (arr, p) => {
      const idx = (arr.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const weight = idx - lower;
      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    const q1 = getPercentile(nums, 0.25);
    const q3 = getPercentile(nums, 0.75);
    const iqr = q3 - q1;

    // Outliers (IQR rule: < Q1 - 1.5*IQR atau > Q3 + 1.5*IQR)
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = nums.filter(v => v < lowerBound || v > upperBound);

    // Variance & Standard Deviation
    const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count > 1 ? count - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // Mode
    const freqMap = {};
    let maxFreq = 0;
    let mode = nums[0];
    nums.forEach(v => {
      freqMap[v] = (freqMap[v] || 0) + 1;
      if (freqMap[v] > maxFreq) {
        maxFreq = freqMap[v];
        mode = v;
      }
    });

    return {
      count,
      sum,
      mean,
      median,
      mode: maxFreq > 1 ? mode : "Tidak ada",
      min,
      max,
      range,
      q1,
      q3,
      iqr,
      variance,
      stdDev,
      outlierCount: outliers.length,
      outliers: outliers.slice(0, 10)
    };
  },

  // Hitung Frekuensi Kolom Kategorik
  computeCategoricalStats(values) {
    const total = values.length;
    const freq = {};

    values.forEach(v => {
      const key = (v === null || v === undefined || v === "") ? "(Kosong / Null)" : String(v);
      freq[key] = (freq[key] || 0) + 1;
    });

    const sorted = Object.entries(freq)
      .map(([val, count]) => ({
        value: val,
        count,
        percent: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      unique: Object.keys(freq).length,
      topValues: sorted.slice(0, 10),
      allValues: sorted
    };
  },

  // Korelasi Pearson Antar Dua Kolom
  calculatePearsonCorrelation(xArr, yArr) {
    const pairs = [];
    for (let i = 0; i < xArr.length; i++) {
      const x = Number(xArr[i]);
      const y = Number(yArr[i]);
      if (!isNaN(x) && !isNaN(y) && xArr[i] !== null && yArr[i] !== null) {
        pairs.push([x, y]);
      }
    }

    const n = pairs.length;
    if (n < 2) return null;

    const xVals = pairs.map(p => p[0]);
    const yVals = pairs.map(p => p[1]);

    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = xVals[i] - meanX;
      const diffY = yVals[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) return 0;
    return numerator / denominator;
  },

  // Matriks Korelasi untuk Seluruh Kolom Numerik
  buildCorrelationMatrix(data, numericCols) {
    const matrix = {};
    numericCols.forEach(col1 => {
      matrix[col1] = {};
      const xVals = data.map(r => r[col1]);
      numericCols.forEach(col2 => {
        if (col1 === col2) {
          matrix[col1][col2] = 1.0;
        } else {
          const yVals = data.map(r => r[col2]);
          matrix[col1][col2] = this.calculatePearsonCorrelation(xVals, yVals);
        }
      });
    });
    return matrix;
  },

  // Filter Data
  filterDataset(data, filterList) {
    if (!filterList || filterList.length === 0) return data;

    return data.filter(row => {
      return filterList.every(f => {
        const rowVal = row[f.column];
        const targetVal = f.value;

        switch (f.operator) {
          case "equals":
            return String(rowVal).toLowerCase() === String(targetVal).toLowerCase();
          case "not_equals":
            return String(rowVal).toLowerCase() !== String(targetVal).toLowerCase();
          case "contains":
            return String(rowVal).toLowerCase().includes(String(targetVal).toLowerCase());
          case "not_contains":
            return !String(rowVal).toLowerCase().includes(String(targetVal).toLowerCase());
          case "greater_than":
            return Number(rowVal) > Number(targetVal);
          case "greater_than_or_equal":
            return Number(rowVal) >= Number(targetVal);
          case "less_than":
            return Number(rowVal) < Number(targetVal);
          case "less_than_or_equal":
            return Number(rowVal) <= Number(targetVal);
          case "is_null":
            return rowVal === null || rowVal === undefined || rowVal === "";
          case "is_not_null":
            return rowVal !== null && rowVal !== undefined && rowVal !== "";
          default:
            return true;
        }
      });
    });
  },

  // Pivot Table Engine
  computePivot(data, rowField, colField, valField, aggType = "sum") {
    if (!data || data.length === 0 || !rowField) return null;

    const rowKeysSet = new Set();
    const colKeysSet = new Set();
    const cellBuckets = {};

    data.forEach(row => {
      const rKey = row[rowField] !== null && row[rowField] !== undefined ? String(row[rowField]) : "(Kosong)";
      const cKey = colField ? (row[colField] !== null && row[colField] !== undefined ? String(row[colField]) : "(Kosong)") : "Total";

      rowKeysSet.add(rKey);
      colKeysSet.add(cKey);

      const bucketKey = `${rKey}:::${cKey}`;
      if (!cellBuckets[bucketKey]) {
        cellBuckets[bucketKey] = [];
      }

      if (valField) {
        const val = Number(row[valField]);
        if (!isNaN(val)) cellBuckets[bucketKey].push(val);
      } else {
        cellBuckets[bucketKey].push(1);
      }
    });

    const rowKeys = Array.from(rowKeysSet).sort();
    const colKeys = Array.from(colKeysSet).sort();

    const aggregate = (nums) => {
      if (!nums || nums.length === 0) return 0;
      switch (aggType) {
        case "sum":
          return nums.reduce((a, b) => a + b, 0);
        case "avg":
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        case "count":
          return nums.length;
        case "min":
          return Math.min(...nums);
        case "max":
          return Math.max(...nums);
        default:
          return nums.reduce((a, b) => a + b, 0);
      }
    };

    const matrix = {};
    const rowTotals = {};
    const colTotals = {};
    let grandTotalValues = [];

    rowKeys.forEach(rKey => {
      matrix[rKey] = {};
      let rowAllValues = [];

      colKeys.forEach(cKey => {
        const bucket = cellBuckets[`${rKey}:::${cKey}`] || [];
        const val = aggregate(bucket);
        matrix[rKey][cKey] = val;

        rowAllValues = rowAllValues.concat(bucket);
        if (!colTotals[cKey]) colTotals[cKey] = [];
        colTotals[cKey] = colTotals[cKey].concat(bucket);
      });

      rowTotals[rKey] = aggregate(rowAllValues);
      grandTotalValues = grandTotalValues.concat(rowAllValues);
    });

    const finalColTotals = {};
    colKeys.forEach(cKey => {
      finalColTotals[cKey] = aggregate(colTotals[cKey] || []);
    });

    return {
      rowKeys,
      colKeys,
      matrix,
      rowTotals,
      colTotals: finalColTotals,
      grandTotal: aggregate(grandTotalValues),
      aggType,
      rowField,
      colField,
      valField
    };
  },

  // Pembersihan Data
  cleanData(data, action, params = {}) {
    const copy = JSON.parse(JSON.stringify(data));

    switch (action) {
      case "remove_duplicates": {
        const seen = new Set();
        return copy.filter(row => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      case "drop_null_rows": {
        const targetCol = params.column;
        return copy.filter(row => {
          if (targetCol) {
            return row[targetCol] !== null && row[targetCol] !== undefined && row[targetCol] !== "";
          }
          return Object.values(row).some(v => v !== null && v !== undefined && v !== "");
        });
      }

      case "fill_nulls": {
        const targetCol = params.column;
        const method = params.method; // 'mean', 'median', 'custom', 'zero'
        const customValue = params.value;

        let fillVal = 0;
        if (method === "mean" || method === "median") {
          const nums = copy.map(r => Number(r[targetCol])).filter(v => !isNaN(v));
          if (nums.length > 0) {
            const stats = this.computeNumericStats(nums);
            fillVal = method === "mean" ? stats.mean : stats.median;
          }
        } else if (method === "custom") {
          fillVal = customValue;
        } else if (method === "zero") {
          fillVal = 0;
        }

        return copy.map(row => {
          if (row[targetCol] === null || row[targetCol] === undefined || row[targetCol] === "") {
            row[targetCol] = fillVal;
          }
          return row;
        });
      }

      case "trim_text": {
        const targetCol = params.column;
        return copy.map(row => {
          if (typeof row[targetCol] === "string") {
            row[targetCol] = row[targetCol].trim();
          }
          return row;
        });
      }

      case "change_case": {
        const targetCol = params.column;
        const caseType = params.caseType; // 'upper', 'lower', 'title'
        return copy.map(row => {
          if (typeof row[targetCol] === "string") {
            if (caseType === "upper") row[targetCol] = row[targetCol].toUpperCase();
            if (caseType === "lower") row[targetCol] = row[targetCol].toLowerCase();
            if (caseType === "title") {
              row[targetCol] = row[targetCol].replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            }
          }
          return row;
        });
      }

      case "delete_column": {
        const targetCol = params.column;
        return copy.map(row => {
          delete row[targetCol];
          return row;
        });
      }

      default:
        return copy;
    }
  },

  // Temuan Cerdas / Auto Insights
  generateInsights(data, meta) {
    const insights = [];
    const totalRows = data.length;

    // 1. Kualitas Data (Missing Values)
    Object.values(meta).forEach(col => {
      if (col.nullPercentage > 20) {
        insights.push({
          type: "warning",
          category: "Kualitas Data",
          title: `Kolom '${col.name}' memiliki banyak nilai kosong`,
          description: `${DataEngine.formatPercent(col.nullPercentage)} (${col.nullCount} dari ${totalRows} baris) bernilai null atau kosong. Disarankan untuk dibersihkan atau diisi.`,
          icon: "alert-triangle"
        });
      }
    });

    // 2. Baris Duplikat
    const seen = new Set();
    let dupCount = 0;
    data.forEach(r => {
      const key = JSON.stringify(r);
      if (seen.has(key)) dupCount++;
      seen.add(key);
    });

    if (dupCount > 0) {
      insights.push({
        type: "info",
        category: "Integritas Data",
        title: `Ditemukan ${dupCount} baris duplikat`,
        description: `Terdapat ${dupCount} rekaman yang identik. Anda dapat menghapusnya di tab Pembersihan Data.`,
        icon: "copy"
      });
    }

    // 3. Outlier pada Kolom Numerik
    const numericCols = Object.values(meta).filter(m => m.type === "numeric");
    numericCols.forEach(m => {
      const vals = data.map(r => r[m.name]);
      const stats = this.computeNumericStats(vals);
      if (stats && stats.outlierCount > 0) {
        insights.push({
          type: "trend",
          category: "Deteksi Anomali",
          title: `Pencilan (Outlier) pada '${m.name}'`,
          description: `Terdeteksi ${stats.outlierCount} nilai pencilan di luar batas wajar (Q1 - 1.5×IQR s/d Q3 + 1.5×IQR). Nilai ekstrem min: ${this.formatNumber(stats.min)}, max: ${this.formatNumber(stats.max)}.`,
          icon: "activity"
        });
      }
    });

    // 4. Korelasi Kuat Antar Kolom Numerik
    if (numericCols.length >= 2) {
      for (let i = 0; i < numericCols.length; i++) {
        for (let j = i + 1; j < numericCols.length; j++) {
          const col1 = numericCols[i].name;
          const col2 = numericCols[j].name;
          const r = this.calculatePearsonCorrelation(
            data.map(d => d[col1]),
            data.map(d => d[col2])
          );

          if (r !== null && Math.abs(r) >= 0.7) {
            insights.push({
              type: "success",
              category: "Korelasi Kuat",
              title: `Hubungan Kuat: '${col1}' & '${col2}'`,
              description: `Nilai korelasi Pearson adalah ${r.toFixed(2)} (${r > 0 ? "positif searah" : "negatif berlawanan"}). Perubahan pada ${col1} berkaitan erat dengan perubahan pada ${col2}.`,
              icon: "trending-up"
            });
          }
        }
      }
    }

    return insights;
  },

  // Export Data ke XLSX
  exportToXLSX(data, fileName = "Analisis_Data.xlsx") {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data_Hasil");
    XLSX.writeFile(wb, fileName);
  },

  // Export Data ke CSV
  exportToCSV(data, fileName = "Analisis_Data.csv") {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
