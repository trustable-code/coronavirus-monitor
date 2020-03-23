"use strict";

const population =
{ "China": 1427647786
, "Italy": 60317546
, "Iran": 83183741
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
, "Malaysia": 32772100
, "Canada": 37894799
, "Portugal": 10276617
, "San Marino": 33344
, "Algeria": 43000000
, "Australia": 25652000
, "Brazil": 210147125
, "Greece": 10768477
, "India": 1352642280
, "Egypt": 100075480
, "Turkey": 82003882
, "Luxembourg": 613894
, "Peru": 32824358
, "Ecuador": 17084358
, "Lebanon": 6859408
, "Argentina": 44938712
, "Hungary": 9772756
};

const countriesWikiUrlThe =
[ "United States"
, "United Kingdom"
, "Netherlands"
, "Philippines"
];

const casesIncreaseDays = 4;

var countries = {};
var maxDisplayCountries;
var sortColumnIndex;

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
  maxDisplayCountries = 20;
  sortColumnIndex = 6;
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
  [ "Cruise Ship"
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
    if (countryData.length > casesIncreaseDays) {
      const oldCases = countryData[countryData.length - casesIncreaseDays - 1]["confirmed"];
      country.casesIncrease = Math.pow(country.cases / oldCases, 1 / casesIncreaseDays) - 1;
    } else {
      country.casesIncrease = 0;
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
  sortCountries();
  renderPage();
}

function sortCountries() {
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
      return a.casesIncrease < b.casesIncrease ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 5) {
    countries.sort(function(a, b) {
      return a.deaths < b.deaths ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 6) {
    countries.sort(function(a, b) {
      return a.deathsRatio < b.deathsRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 7) {
    countries.sort(function(a, b) {
      return a.deathsCasesRatio < b.deathsCasesRatio ? 1 : -1;
    });
  }
}

function renderPage() {
  dynamicContent.innerHTML = "";

  const table = document.createElement("TABLE");
  dynamicContent.appendChild(table);

  // Table head
  const row = document.createElement("TR");
  table.appendChild(row);
  const columns = ["Country", "Population", "Cases", "Cases/Population", "Cases Increase per Day", "Deaths", "Deaths/Population", "Deaths/Cases"];
  const columnTooltips = {4: "Average of the last " + casesIncreaseDays + " days"};
  for (const i in columns) {
    const cell = document.createElement("TH");
    cell.appendChild(document.createTextNode(columns[i]));
    if (i in columnTooltips) {
      cell.title = columnTooltips[i];
    }
    if (i == sortColumnIndex) {
      const sortIcon = document.createElement("SPAN");
      sortIcon.classList.add("sortIcon");
      cell.appendChild(sortIcon);
      sortIcon.appendChild(document.createElement("SPAN"));
    } else if (i > 0) {
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

  for (const i in countries) {
    if (i >= maxDisplayCountries) {
      const a = document.createElement("A");
      dynamicContent.appendChild(a);
      a.href = '#';
      a.appendChild(document.createTextNode("More entries"));
      a.addEventListener("click", function(event) {
        event.preventDefault();
        maxDisplayCountries = maxDisplayCountries + 10;
        renderPage();
      });
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
    addCellWithInt(row, country.population);
    // cases
    addCellWithInt(row, country.cases);
    // cases per population
    addCellWithRatio(row, country.casesRatio, 3, 0.0001);
    // cases increase
    addCellWithRatio(row, country.casesIncrease, 0, 0.1);
    // deaths
    addCellWithInt(row, country.deaths);
    // deaths per population
    addCellWithRatio(row, country.deathsRatio, 5, 0.000002);
    // deaths per cases
    addCellWithRatio(row, country.deathsCasesRatio, 1, 0.01);
  }
}

function roundTo3SignificantDigits(value) {
  if (value > 1000) {
    const d = Math.pow(10, value.toString().length - 3);
    return Math.round(value / d) * d;
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

function addCellWithInt(row, value) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  cell.appendChild(document.createTextNode(roundTo3SignificantDigits(value).toLocaleString()));
  cell.classList.add("number");
  row.appendChild(cell);
}

function addCellWithRatio(row, value, numberOfDecimals, redAbove) {
  if (value == 0) {
    addCellWithNaValue(row);
    return;
  }
  let cell = document.createElement("TD");
  var text = roundTo3SignificantDigits(value * 100).toFixed(numberOfDecimals);
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
    } else if (redAbove != -1 && value > redAbove) {
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

main();
