function run(all_datas) {
  taux_global(all_datas);
  variation_de_taux(all_datas);
  taux_sexe(all_datas);
  taux_age(all_datas);
  taux_origin(all_datas);
  sélectionner_age(all_datas);
  sélectionner_sexe(all_datas);
  sélectionner_origin(all_datas);
}


function taux_global(all_datas) {
  let taux_total = all_datas.filter(d => d.STUB_NAME === "Total");
  taux_total.sort((a, b) => +a.YEAR - +b.YEAR);
  let years = taux_total.map(d => +d.YEAR);
  let estimates = taux_total.map(d => +d.ESTIMATE);

  let data = [{
    x: years,
    y: estimates,
    mode: 'markers',
    type: 'scatter',
    marker: { size: 8 }
  }];

  let forme = {
    title: { text: 'Taux de suicide global par année', font: { size: 18 } },
    xaxis: { title: 'Années' },
    yaxis: { title: 'Taux de suicide' },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_taux', data, forme);
}


function variation_de_taux(all_datas) {
  let taux_total = all_datas.filter(d => d.STUB_NAME === "Total");
  taux_total.sort((a, b) => +a.YEAR - +b.YEAR);
  let years = taux_total.map(d => +d.YEAR);
  let estimates = taux_total.map(d => +d.ESTIMATE);

  let variations = [];
  let variation_annuelle = [];
  for (let i = 1; i < estimates.length; i++) {
    let delta = (estimates[i] - estimates[i - 1]) / estimates[i - 1];
    variations.push(delta * 100);
    variation_annuelle.push(years[i]);
  }

  let data = [{
    x: variation_annuelle,
    y: variations,
    type: 'bar'
  }];

  let forme = {
    title: { text: 'Variation annuelle du taux de suicide (%)', font: { size: 18 } },
    xaxis: { title: 'Années' },
    yaxis: { title: 'Variation (%)' },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_évolution', data, forme);
}


function taux_sexe(all_datas) {
  let taux_sex = all_datas.filter(d => d.STUB_NAME === "Sex");
  let groupe_sex = {};
  taux_sex.forEach(d => {
    let sex = d.STUB_LABEL.trim();
    let val = +d.ESTIMATE;
    if (!groupe_sex[sex]) {
      groupe_sex[sex] = { sum: 0, count: 0 };
    }
    groupe_sex[sex].sum += val;
    groupe_sex[sex].count += 1;
  });

  let labels = [];
  let values = [];
  for (let sex in groupe_sex) {
    labels.push(sex);
    values.push(groupe_sex[sex].sum / groupe_sex[sex].count);
  }

  let data = [{
    labels: labels,
    values: values,
    type: 'pie',
    textinfo: 'label+percent',
    textposition: 'inside',
    hoverinfo: 'label+value+percent',
    marker: { colors: ['#007bff', '#dc3545'] },
    insidetextfont: { color: '#fff', size: 16 }
  }];

  let forme = {
    title: { text: 'Répartition par sexe (moyenne)', font: { size: 16 } },
    legend: { orientation: 'h', x: 0.3, y: -0.1 },
    margin: { t: 60, b: 20 }
  };

  Plotly.newPlot('myplot_sexe', data, forme);
}


function sélectionner_sexe(all_datas) {
  let data_sex = all_datas.filter(d => d.STUB_NAME === "Sex");
  let groupes = [];
  data_sex.forEach(d => {
    let label = d.STUB_LABEL.trim();
    if (groupes.indexOf(label) === -1) {
      groupes.push(label);
    }
  });
  let select = document.createElement("select");
  select.id = "select_sexe";
  select.className = "form-control mb-2";
  let option = document.createElement("option");
  option.value = "";
  option.textContent = "Sélectionnez un genre";
  select.appendChild(option);
  groupes.forEach(g => {
    let opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
  let container = document.getElementById("myplot_sexe");
  let parent = container.parentElement;
  parent.insertBefore(select, container);
  select.addEventListener("change", function() {
    let selected = this.value;
    if (selected === "") {
      taux_sexe(all_datas);
    } else {
      nuage_sexe(selected, all_datas);
    }
  });
}


function nuage_sexe(groupe_sex, all_datas) {
  let filtered = all_datas.filter(d =>
    d.STUB_NAME === "Sex" && d.STUB_LABEL.trim() === groupe_sex
  );
  filtered.sort((a, b) => +a.YEAR - +b.YEAR);
  let years = filtered.map(d => +d.YEAR);
  let estimates = filtered.map(d => +d.ESTIMATE);

  let nuage_data = [{
    x: years,
    y: estimates,
    mode: 'markers',
    type: 'scatter',
    marker: { size: 8 }
  }];

  let nuage_forme = {
    title: { text: 'Taux de suicide pour "' + groupe_sex + '"', font: { size: 18 } },
    xaxis: { title: 'Années' },
    yaxis: { title: 'Taux de suicide' },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_sexe', nuage_data, nuage_forme);
}


function taux_age(all_datas) {
  let taux_age = all_datas.filter(d => d.STUB_NAME === "Age");
  let groupe_age = {};
  let ordre_age = [];
  taux_age.forEach(d => {
    let label = d.STUB_LABEL.trim();
    let label_norm = label.toLowerCase();
    let val = +d.ESTIMATE;
    if (ordre_age.indexOf(label_norm) === -1) {
      ordre_age.push(label_norm);
    }
    if (!groupe_age[label_norm]) {
      groupe_age[label_norm] = { sum: 0, count: 0, label: label };
    }
    groupe_age[label_norm].sum += val;
    groupe_age[label_norm].count += 1;
  });

  let liste_tranches = ordre_age.map(key => {
    let obj = groupe_age[key];
    return { label: obj.label, norm: key, value: obj.sum / obj.count };
  });

  let labels = liste_tranches.map(p => p.label);
  let values = liste_tranches.map(p => p.value);

  let data = [{
    labels: labels,
    values: values,
    type: 'pie',
    textinfo: 'label+percent',
    textposition: 'inside',
    hoverinfo: 'label+value+percent',
    marker: {
      colors: ['#28a745', '#ffc107', '#17a2b8', '#6c757d', '#e83e8c', '#007bff', '#dc3545']
    },
    insidetextfont: { color: '#fff', size: 12 }
  }];

  let forme = {
    title: { text: 'Répartition par âge (moyenne)', font: { size: 16 } },
    legend: { orientation: 'h', x: 0.2, y: -0.1 },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_age', data, forme);
}


function sélectionner_age(all_datas) {
  let data_age = all_datas.filter(d => d.STUB_NAME === "Age");
  let groupes = [];
  data_age.forEach(d => {
    let label = d.STUB_LABEL.trim();
    if (groupes.indexOf(label) === -1) {
      groupes.push(label);
    }
  });
  let select = document.createElement("select");
  select.id = "select_age";
  select.className = "form-control mb-2";
  let option = document.createElement("option");
  option.value = "";
  option.textContent = "Sélectionnez une tranche d'âge";
  select.appendChild(option);
  groupes.forEach(g => {
    let opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
  let container = document.getElementById("myplot_age");
  let parent = container.parentElement;
  parent.insertBefore(select, container);
  select.addEventListener("change", function() {
    let selected = this.value;
    if (selected === "") {
      taux_age(all_datas);
    } else {
      nuage_age(selected, all_datas);
    }
  });
}


function nuage_age(groupe_age, all_datas) {
  let filtered = all_datas.filter(d =>
    d.STUB_NAME === "Age" && d.STUB_LABEL.trim() === groupe_age
  );
  filtered.sort((a, b) => +a.YEAR - +b.YEAR);
  let years = filtered.map(d => +d.YEAR);
  let estimates = filtered.map(d => +d.ESTIMATE);

  let nuage_data = [{
    x: years,
    y: estimates,
    mode: 'markers',
    type: 'scatter',
    marker: { size: 8 }
  }];

  let nuage_forme = {
    title: { text: 'Taux de suicide pour"' + groupe_age + '"', font: { size: 16 } },
    xaxis: { title: 'Années' },
    yaxis: { title: 'Taux de suicide' },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_age', nuage_data, nuage_forme);
}


function taux_origin(all_datas) {
  let taux_origin = all_datas.filter(d => d.STUB_NAME === "Sex and race");
  let groupe_origine = {};
  taux_origin.forEach(d => {
    let parts = d.STUB_LABEL.split(":");
    let origin = parts.length > 1 ? parts[1].trim() : d.STUB_LABEL.trim();
    let val = +d.ESTIMATE;
    if (!groupe_origine[origin]) {
      groupe_origine[origin] = { sum: 0, count: 0 };
    }
    groupe_origine[origin].sum += val;
    groupe_origine[origin].count += 1;
  });

  let labels = [];
  let values = [];
  for (let orig in groupe_origine) {
    labels.push(orig);
    values.push(groupe_origine[orig].sum / groupe_origine[orig].count);
  }

  let data = [{
    labels: labels,
    values: values,
    type: 'pie',
    textinfo: 'label+percent',
    textposition: 'inside',
    hoverinfo: 'label+value+percent',
    marker: { colors: ['#6610f2', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'] },
    insidetextfont: { color: '#fff', size: 12 }
  }];

  let forme = {
    title: { text: 'Répartition par origine (moyenne)', font: { size: 16 } },
    legend: { orientation: 'h', x: 0.2, y: -0.1 },
    margin: { t: 60, b: 20 },
    width: 350,
    height: 400

  };

  Plotly.newPlot('myplot_origin', data, forme);
}


function sélectionner_origin(all_datas) {
  let data_origin = all_datas.filter(d => d.STUB_NAME === "Sex and race");
  let groupes = [];
  data_origin.forEach(d => {
    let parts = d.STUB_LABEL.split(":");
    let label = parts.length > 1 ? parts[1].trim() : d.STUB_LABEL.trim();
    if (groupes.indexOf(label) === -1) {
      groupes.push(label);
    }
  });
  let select = document.createElement("select");
  select.id = "select_origin";
  select.className = "form-control mb-2";
  let option = document.createElement("option");
  option.value = "";
  option.textContent = "Sélectionnez une origine";
  select.appendChild(option);
  groupes.forEach(g => {
    let opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
  let container = document.getElementById("myplot_origin");
  let parent = container.parentElement;
  parent.insertBefore(select, container);
  select.addEventListener("change", function() {
    let selected = this.value;
    if (selected === "") {
      taux_origin(all_datas);
    } else {
      nuage_origin(selected, all_datas);
    }
  });
}


function nuage_origin(groupe_origin, all_datas) {
  let filtered = all_datas.filter(d =>
    d.STUB_NAME === "Sex and race" &&
    ((d.STUB_LABEL.split(":").length > 1 ? d.STUB_LABEL.split(":")[1].trim() : d.STUB_LABEL.trim()) === groupe_origin)
  );

  let data_par_annee = {};
  filtered.forEach(d => {
    let annee = +d.YEAR;
    let estimate = +d.ESTIMATE;
    if (!data_par_annee[annee]) {
      data_par_annee[annee] = [];
    }
    data_par_annee[annee].push(estimate);
  });

  let years = Object.keys(data_par_annee).map(y => +y);
  years.sort((a, b) => a - b);
  let avg_estimates = years.map(year => {
    let values = data_par_annee[year];
    let sum = values.reduce((acc, cur) => acc + cur, 0);
    return sum / values.length;
  });


  let nuage_data = [{
    x: years,
    y: avg_estimates,
    mode: 'markers',
    type: 'scatter',
    marker: { size: 8 }
  }];

  let nuage_forme = {
    title: { text: 'Taux de suicide pour "' + groupe_origin + '"', font: { size: 18 } },
    xaxis: { title: 'Années' },
    yaxis: { title: 'Taux de suicide' },
    margin: { t: 60, b: 40 }
  };

  Plotly.newPlot('myplot_origin', nuage_data, nuage_forme);
}
