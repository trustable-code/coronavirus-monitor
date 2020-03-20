"use strict";

const population =
{ "China": 1427647786
, "Italy": 60317546
, "Iran": 60317546
, "Spain": 46733038
, "Germany": 83149300
, "France": 67022000
, "United States": 328239523
, "South Korea": 51709098
, "United Kingdom": 67545757
, "Netherlands": 17424978
, "Japan": 126150000
, "Switzerland": 8570146
, "Indonesia": 267670543
, "Philippines": 100981437
, "Austria": 8902600
, "Norway": 5367580
, "Belgium": 11515793
, "Sweden": 10333456
, "Denmark": 5822763
, "Iraq": 38433600
, "Poland": 38386000
};

const countriesWikiUrlThe =
[ "United States"
, "United Kingdom"
, "Netherlands"
, "Philippines"
];

const maxDisplayCountries = 20;

const dynamicContent = document.createElement("DIV");
document.body.appendChild(dynamicContent);

var countries = {};
var curSortColumnIndex = -1;

function loadData() {
  let r = new XMLHttpRequest();
  r.addEventListener("load", OnLoadDataFinished);
  r.open("GET", "https://pomber.github.io/covid19/timeseries.json");
  r.send();
}

function OnLoadDataFinished() {
  const renamingTable =
  { "US": "United States"
  , "Korea, South": "South Korea"
  };
  const data = JSON.parse(this.responseText);
  countries = [];
  for (var countryName in data) {
    const countryData = data[countryName];
    if (countryName in renamingTable) {
      countryName = renamingTable[countryName];
    }
    const latestDataSet = countryData[countryData.length - 1];
    var country = {};
    country.name = countryName;
    country.wikiUrl = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_";
    if (countriesWikiUrlThe.includes(countryName)) {
      country.wikiUrl = country.wikiUrl + "the_";
    }
    country.wikiUrl = country.wikiUrl + countryName.replace(/ /g, '_');

    country.cases = latestDataSet["confirmed"];
    country.deaths = latestDataSet["deaths"];
    if (country.cases < 50) {
      continue;
    }
    country.deathsCasesRatio = country.deaths / country.cases;
    if (countryName in population) {
      country.population = population[countryName];
      country.casesRatio = country.cases / country.population;
      country.deathsRatio = country.deaths / country.population;
    } else {
      country.population = 0;
      country.casesRatio = 0;
      country.deathsRatio = 0;
    }
    countries.push(country);
  }
  sortCountries(5);
  renderPage();
}

function sortCountries(sortColumnIndex) {
  if (sortColumnIndex == 1) {
    countries.sort(function(a, b) {
      return a.population < b.population ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 2) {
    countries.sort(function(a, b) {
      return a.cases < b.cases ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 3) {
    countries.sort(function(a, b) {
      return a.casesRatio < b.casesRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 4) {
    countries.sort(function(a, b) {
      return a.deaths < b.deaths ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 5) {
    countries.sort(function(a, b) {
      return a.deathsRatio < b.deathsRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 6) {
    countries.sort(function(a, b) {
      return a.deathsCasesRatio < b.deathsCasesRatio ? 1 : -1;
    });
  }
  curSortColumnIndex = sortColumnIndex;
}

function renderPage() {
  dynamicContent.innerHTML = "";

  const table = document.createElement("TABLE");
  dynamicContent.appendChild(table);

  // Table head
  const row = document.createElement("TR");
  table.appendChild(row);
  const columns = ["Country", "Population", "Cases", "Cases/Population", "Deaths", "Deaths/Population", "Deaths/Cases"];
  for (const i in columns) {
    const cell = document.createElement("TH");
    cell.appendChild(document.createTextNode(columns[i]));
    if (i == curSortColumnIndex) {

      const sortIcon = document.createElement("SPAN");
      sortIcon.classList.add("sortIcon");
      cell.appendChild(sortIcon);
      sortIcon.appendChild(document.createElement("SPAN"));
    } else if (i > 0) {
      cell.addEventListener("click", function(event) {
        event.preventDefault();
        sortCountries(i);
        renderPage();
      });
      cell.classList.add("sortable");
    }
    row.appendChild(cell);
  }

  for (const i in countries) {
    if (i >= maxDisplayCountries) {
      break;
    }
    const country = countries[i];
    const row = document.createElement("TR");
    table.appendChild(row);
    // country
    var a = document.createElement("A");
    a.href = country.wikiUrl;
    a.target = "_blank";
    a.appendChild(document.createTextNode(country.name));
    var cell = document.createElement("TD");
    cell.appendChild(a);
    row.appendChild(cell);
    // population
    addCellWithInt(row, Math.round(country.population / 100000) * 100000);
    // cases
    addCellWithInt(row, country.cases);
    // cases per population
    addCellWithRatio(row, country.casesRatio, 4);
    // deaths
    addCellWithInt(row, country.deaths);
    // deaths per population
    addCellWithRatio(row, country.deathsRatio, 6);
    // deaths per cases
    addCellWithRatio(row, country.deathsCasesRatio, 2);
  }
}

function addCellWithInt(row, value) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  cell.appendChild(document.createTextNode(value.toLocaleString()));
  cell.classList.add("number");
  row.appendChild(cell);
}

function addCellWithRatio(row, value, numberOfDecimals) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  var text = (value * 100).toFixed(numberOfDecimals);
  var grey = true;
  for (var i = 0; i < text.length; i++) {
    const char = text[i];
    if (grey && !['0', '.', ','].includes(char)) {
      grey = false;
    }
    var span = document.createElement("SPAN");
    span.appendChild(document.createTextNode(char));
    if (grey) {
      span.classList.add("grey");
    } else {
      span.classList.add("red");
    }
    cell.appendChild(span);
  }
  cell.appendChild(document.createTextNode(" %"));
  cell.classList.add("number");
  row.appendChild(cell);
}

function addCellWithNaValue(row) {
  let cell = document.createElement("TD");
  cell.appendChild(document.createTextNode("NA"));
  cell.classList.add("NA");
  row.appendChild(cell);
}

loadData();
