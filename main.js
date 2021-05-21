"use strict";

const numberOfEntriesPerPage = 50;

var countries = {};
var maxDisplayCountries;
var sortColumnIndex;
var hideSmallCountries;

const dynamicContent = document.createElement("DIV");
document.body.appendChild(dynamicContent);

function main() {
  const headline = document.getElementsByTagName("H1")[0];
  headline.addEventListener("click", function(event) {
    event.preventDefault();
    reset();
    sortCountries();
    renderPage();
  });
  headline.style.cursor = "pointer";
  reset();
  loadData();
}

function reset() {
  maxDisplayCountries = numberOfEntriesPerPage;
  sortColumnIndex = 8;
  hideSmallCountries = false;
}

function loadData() {
  let r = new XMLHttpRequest();
  r.addEventListener("load", onLoadDataFinished);
  r.open("GET", "https://pomber.github.io/covid19/timeseries.json");
  r.send();
}

function onLoadDataFinished() {
  const renamingTable =
  { "US": "United States"
  , "Korea, South": "South Korea"
  };
  const invalidCountries =
  [ "Diamond Princess"
  ];
  const data = JSON.parse(this.responseText);
  countries = [];
  for (var countryName in data) {
    const countryData = data[countryName];
    if (invalidCountries.includes(countryName)) {
      continue;
    }
    if (countryName in renamingTable) {
      countryName = renamingTable[countryName];
    }
    const latestDataSet = countryData[countryData.length - 1];
    var country = {};
    country.name = countryName;
    country.wikiUrl = "https://en.wikipedia.org/wiki/COVID-19_pandemic_in_";
    if (countriesWikiUrlThe.includes(countryName)) {
      country.wikiUrl = country.wikiUrl + "the_";
    }
    country.wikiUrl = country.wikiUrl + countryName.replace(/ /g, '_');

    country.cases = latestDataSet["confirmed"];
    country.deaths = latestDataSet["deaths"];
    if (country.cases < 50) {
      continue;
    }

    country.population = 0;
    country.casesRatio = 0;
    country.deathsRatio = 0;
    country.deathsCasesRatio = country.deaths / country.cases;

    if (countryName in population) {
      country.population = population[countryName];
      country.casesRatio = country.cases / country.population;
      country.deathsRatio = country.deaths / country.population;
    }

    // calculate death rate per year
    country.deathRatePerYear = 0;
    if (country.population > 0) {
      for (var i = 0; i < countryData.length; i++) {
        if (countryData[i]["deaths"] / country.population >= 0.0000001) {
          const daysSinceStart = countryData.length - i;
          country.deathRatePerYear = country.deaths / country.population / daysSinceStart * 365;
          break;
        }
      }
    }

    // calculate new cases since 7 days per 100,000 people
    country.incidence = calculateIncidence(countryData, country, 0);

    // calculate new cases change
    country.incidenceChange = country.incidence - calculateIncidence(countryData, country, 7);

    countries.push(country);
  }
  sortCountries();
  renderPage();
}

function calculateIncidence(countryData, country, daysBack) {
  if (country.population == 0) {
    return 0;
  }
  var i = countryData.length - 1 - daysBack;
  var count = 0;
  const confirmedNew = countryData[i]["confirmed"];
  while (i > 0 && count < 7) {
    count++;
    i--;
  }
  const confirmedOld = countryData[i]["confirmed"];
  return (confirmedNew - confirmedOld) / country.population * 100000;
}

function sortCountries() {
  if (sortColumnIndex == 2) {
    countries.sort(function(a, b) {
      return sortHelper(a.population, b.population);
    });
  }
  else if (sortColumnIndex == 3) {
    countries.sort(function(a, b) {
      return sortHelper(a.cases, b.cases);
    });
  }
  else if (sortColumnIndex == 4) {
    countries.sort(function(a, b) {
      return sortHelper(a.casesRatio, b.casesRatio);
    });
  }
  else if (sortColumnIndex == 5) {
    countries.sort(function(a, b) {
      return sortHelper(a.incidence, b.incidence);
    });
  }
  else if (sortColumnIndex == 6) {
    countries.sort(function(a, b) {
      return sortHelper(a.incidenceChange, b.incidenceChange);
    });
  }
  else if (sortColumnIndex == 7) {
    countries.sort(function(a, b) {
      return sortHelper(a.deaths, b.deaths);
    });
  }
  else if (sortColumnIndex == 8) {
    countries.sort(function(a, b) {
      return sortHelper(a.deathsRatio, b.deathsRatio);
    });
  }
  else if (sortColumnIndex == 9) {
    countries.sort(function(a, b) {
      return sortHelper(a.deathsCasesRatio, b.deathsCasesRatio);
    });
  }
  else if (sortColumnIndex == 10) {
    countries.sort(function(a, b) {
      return sortHelper(a.deathRatePerYear, b.deathRatePerYear);
    });
  }
}

function sortHelper(a, b) {
  if (a == 0 && b != 0)
    return 1;
  if (a != 0 && b == 0)
    return -1;
  return a < b ? 1 : -1;
}

function renderPage() {
  dynamicContent.innerHTML = "";

  renderFilterButtons();

  renderTable();
}

function renderTable() {
  const table = document.createElement("TABLE");
  dynamicContent.appendChild(table);

  // Table head
  const row = document.createElement("TR");
  table.appendChild(row);
  const columns = ["#", "Country", "Population", "Cases", "Cases/Population", "New Cases Since 7 Days\nper 100,000 people", "New Cases Change", "Deaths", "Deaths/Population", "Deaths/Cases", "Death Rate\nper Year"];
  for (const i in columns) {
    const cell = document.createElement("TH");
    cell.appendChild(document.createTextNode(columns[i]));
    if (i == sortColumnIndex) {
      const sortIcon = document.createElement("SPAN");
      sortIcon.classList.add("sortIcon");
      cell.appendChild(sortIcon);
      sortIcon.appendChild(document.createElement("SPAN"));
    } else if (i > 1) {
      cell.addEventListener("click", function(event) {
        event.preventDefault();
        sortColumnIndex = i;
        sortCountries();
        renderPage();
      });
      cell.classList.add("sortable");
    }
    row.appendChild(cell);
  }

  // table body
  var count = 0;
  for (const i in countries) {
    const country = countries[i];

    if (hideSmallCountries && country.population < 5000000) {
      continue;
    }

    if (count >= maxDisplayCountries) {
      const a = document.createElement("A");
      dynamicContent.appendChild(a);
      a.classList.add("button");
      a.href = '#';
      a.appendChild(document.createTextNode("More entries"));
      a.addEventListener("click", function(event) {
        event.preventDefault();
        maxDisplayCountries = maxDisplayCountries + numberOfEntriesPerPage;
        renderPage();
      });
      break;
    }

    const row = document.createElement("TR");
    table.appendChild(row);
    // index
    var cell = document.createElement("TD");
    cell.appendChild(document.createTextNode(count + 1));
    cell.classList.add("index");
    row.appendChild(cell);
    // country
    var a = document.createElement("A");
    a.href = country.wikiUrl;
    a.target = "_blank";
    a.appendChild(document.createTextNode(country.name));
    cell = document.createElement("TD");
    cell.appendChild(a);
    if (country.name in countriesAdditionText) {
      cell.innerHTML = cell.innerHTML + " <small>(" + countriesAdditionText[country.name] + ")</small>";
    }
    row.appendChild(cell);
    // population
    addCellWithInt(row, country.population);
    // cases
    addCellWithInt(row, country.cases);
    // cases per population
    addCellWithRatio(row, country.casesRatio, 1);
    // new cases since 7 days per 100,000 people
    addCellWithInt(row, country.incidence, 500);
    // new cases change
    addCellWithChange(row, country.incidenceChange);
    // deaths
    addCellWithInt(row, country.deaths);
    // deaths per population
    addCellWithRatio(row, country.deathsRatio, 2, 0.0017);
    // deaths per cases
    addCellWithRatio(row, country.deathsCasesRatio, 1, 0.05);
    // death rate per year
    addCellWithRatio(row, country.deathRatePerYear, 2, 0.0015);

    count++;
  }
}

function renderFilterButtons() {
  if (!hideSmallCountries) {
    const hideSmallCountriesButton = addButton("Hide small countries");
    hideSmallCountriesButton.addEventListener("click", function(event) {
      event.preventDefault();
      hideSmallCountries = true;
      renderPage();
    });
  } else {
    const showSmallCountriesButton = addButton("Show small countries");
    showSmallCountriesButton.addEventListener("click", function(event) {
      event.preventDefault();
      hideSmallCountries = false;
      renderPage();
    });
  }
}

function addButton(title) {
  const button = document.createElement("A");
  dynamicContent.appendChild(button);
  button.classList.add("button");
  button.href = '#';
  button.appendChild(document.createTextNode(title));
  return button;
}

function roundTo3SignificantDigits(value) {
  if (value > 1000) {
    const d = Math.pow(10, Math.round(value).toString().length - 3);
    return Math.round(value / d) * d;
  } else if (value <= 0.00000001) {
    return value;
  } else {
    var d = 1;
    var x = value;
    while (x < 100) {
      x = x * 10;
      d = d * 10;
    }
    return Math.round(value * d) / d;
  }
}

function addCellWithInt(row, value, redAbove = -1) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  value = roundTo3SignificantDigits(Math.round(value));
  cell.appendChild(document.createTextNode(value.toLocaleString()));
  cell.classList.add("number");
  if (redAbove != -1 && value > redAbove) {
    cell.classList.add("red");
  }
  row.appendChild(cell);
}

function addCellWithRatio(row, value, numberOfDecimals = 0, redAbove = -1) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  if (redAbove != -1) {
    redAbove = redAbove * 100;
  }
  let cell = addCellWithFloat(row, value * 100, numberOfDecimals, redAbove);
  cell.appendChild(document.createTextNode(" %"));
}

function addCellWithChange(row, value, numberOfDecimals = 0, redAbove = -1) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = addCellWithFloat(row, value, numberOfDecimals, redAbove);
  if (value > 0) {
    cell.insertBefore(document.createTextNode("+"), cell.firstChild);
  }
  if (cell.textContent == "-0" || cell.textContent == "+0") {
    cell.innerHTML = "0";
  }
}

function addCellWithFloat(row, value, numberOfDecimals = 0, redAbove = -1) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  const text = roundTo3SignificantDigits(value).toFixed(numberOfDecimals);
  var grey = true;
  for (var i = 0; i < text.length; i++) {
    const char = text[i];
    if (grey && !['0', '.', ','].includes(char)) {
      grey = false;
    }
    var span = document.createElement("SPAN");
    span.appendChild(document.createTextNode(char));
    if (grey && i < text.length - 1) {
      span.classList.add("grey");
    } else if (redAbove != -1 && value > redAbove) {
      span.classList.add("red");
    }
    cell.appendChild(span);
  }
  cell.classList.add("number");
  row.appendChild(cell);
  return cell;
}

function addCellWithNaValue(row) {
  let cell = document.createElement("TD");
  cell.appendChild(document.createTextNode("NA"));
  cell.classList.add("NA");
  row.appendChild(cell);
}

main();
