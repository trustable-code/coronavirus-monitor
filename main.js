"use strict";

const casesIncreaseDays = 7;

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
  maxDisplayCountries = 25;
  sortColumnIndex = 8;
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
    country.casesIncreaseRatio = 0;

    const oldCases = countryData[countryData.length - casesIncreaseDays - 1]["confirmed"];
    if (oldCases > 0) {
      country.casesGrowthRate = Math.pow(country.cases / oldCases, 1 / casesIncreaseDays) - 1;
      if (country.casesGrowthRate < 0) {
        country.casesGrowthRate = 0;
      }
    } else {
      country.casesGrowthRate = 0;
    }
    country.deathsCasesRatio = country.deaths / country.cases;
    if (countryName in population) {
      country.population = population[countryName];
      country.casesRatio = country.cases / country.population;
      country.deathsRatio = country.deaths / country.population;
      if (country.casesGrowthRate > 0) {
        country.casesIncreaseRatio = (country.cases * Math.pow(1 + country.casesGrowthRate, 30)) / country.population;
      }
    }

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

    countries.push(country);
  }
  sortCountries();
  renderPage();
}

function sortCountries() {
  if (sortColumnIndex == 2) {
    countries.sort(function(a, b) {
      return a.population < b.population ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 3) {
    countries.sort(function(a, b) {
      return a.cases < b.cases ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 4) {
    countries.sort(function(a, b) {
      return a.casesRatio < b.casesRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 5) {
    countries.sort(function(a, b) {
      return a.casesGrowthRate < b.casesGrowthRate ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 6) {
    countries.sort(function(a, b) {
      return a.casesIncreaseRatio < b.casesIncreaseRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 7) {
    countries.sort(function(a, b) {
      return a.deaths < b.deaths ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 8) {
    countries.sort(function(a, b) {
      return a.deathsRatio < b.deathsRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 9) {
    countries.sort(function(a, b) {
      return a.deathsCasesRatio < b.deathsCasesRatio ? 1 : -1;
    });
  }
  else if (sortColumnIndex == 10) {
    countries.sort(function(a, b) {
      return a.deathRatePerYear < b.deathRatePerYear ? 1 : -1;
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
  const columns = ["#", "Country", "Population", "Cases", "Cases/Population", "Cases Growth\nRate per Day", "Cases/Population\nGrowth per Month", "Deaths", "Deaths/Population", "Deaths/Cases", "Death Rate\nper Year"];
  const columnTooltips = {5: "Average of the last " + casesIncreaseDays + " days"};
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

  for (const i in countries) {
    if (i >= maxDisplayCountries) {
      const a = document.createElement("A");
      dynamicContent.appendChild(a);
      a.classList.add("button");
      a.href = '#';
      a.appendChild(document.createTextNode("More entries"));
      a.addEventListener("click", function(event) {
        event.preventDefault();
        maxDisplayCountries = maxDisplayCountries + 25;
        renderPage();
      });
      break;
    }
    const country = countries[i];
    const row = document.createElement("TR");
    table.appendChild(row);
    // index
    var cell = document.createElement("TD");
    cell.appendChild(document.createTextNode(parseInt(i) + 1));
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
    addCellWithRatio(row, country.casesRatio, 2);
    // cases growth rate per day
    addCellWithRatio(row, country.casesGrowthRate, 1);
    // cses growth per population and month
    addCellWithRatio(row, country.casesIncreaseRatio, 2, 0.01);
    // deaths
    addCellWithInt(row, country.deaths);
    // deaths per population
    addCellWithRatio(row, country.deathsRatio, 3, 0.0005);
    // deaths per cases
    addCellWithRatio(row, country.deathsCasesRatio, 1, 0.1);
    // death rate per year
    addCellWithRatio(row, country.deathRatePerYear, 2, 0.002);
  }
}

function roundTo3SignificantDigits(value) {
  if (value > 1000) {
    const d = Math.pow(10, value.toString().length - 3);
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
  const text = roundTo3SignificantDigits(value * 100).toFixed(numberOfDecimals);
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
