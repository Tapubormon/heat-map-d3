const width = 1200;
const height = 600;
const padding = 60;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(res => res.json())
  .then(data => {
    const baseTemp = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    const years = monthlyData.map(d => d.year);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const xScale = d3.scaleBand()
      .domain(d3.range(d3.min(years), d3.max(years) + 1))
      .range([padding, width - padding]);

    const yScale = d3.scaleBand()
      .domain(d3.range(0, 12))
      .range([padding, height - padding]);

    const colorScale = d3.scaleThreshold()
      .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6])
      .range([
        "#313695", "#4575b4", "#74add1", "#abd9e9",
        "#e0f3f8", "#fee090", "#fdae61", "#f46d43", "#d73027"
      ]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => months[month]);

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    const tooltip = d3.select("#tooltip");

    svg.selectAll(".cell")
      .data(monthlyData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .on("mouseover", (event, d) => {
        const temp = (baseTemp + d.variance).toFixed(2);
        tooltip.style("opacity", 0.9)
          .html(
            `${d.year} - ${months[d.month - 1]}<br/>
                Temperature: ${temp}℃<br/>
                Variance: ${d.variance.toFixed(2)}℃`
          )
          .attr("data-year", d.year)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendColors = colorScale.range();
    const legendThresholds = colorScale.domain();

    const legendX = d3.scaleLinear()
      .domain([d3.min(legendThresholds), d3.max(legendThresholds)])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendX)
      .tickValues(legendThresholds)
      .tickFormat(d3.format(".1f"));

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${padding}, ${height - padding + 40})`);

    legend.selectAll("rect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / legendColors.length))
      .attr("y", 0)
      .attr("width", legendWidth / legendColors.length)
      .attr("height", legendHeight)
      .attr("fill", d => d);

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });