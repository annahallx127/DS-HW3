// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
  // Convert string values to numbers
  data.forEach(function(d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 24, right: 24, bottom: 48, left: 60 };
  const width = 760 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales for x and y axes
  const groups = [...new Set(data.map(d => d.AgeGroup))];
  const xScale = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding(0.35);

  const likesExtent = d3.extent(data, d => d.Likes);
  // Add 10% padding on y domain
  const pad = (likesExtent[1] - likesExtent[0]) * 0.1;
  const yScale = d3.scaleLinear()
    .domain([Math.max(0, likesExtent[0] - pad), likesExtent[1] + pad])
    .nice()
    .range([height, 0]);

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 36)
    .attr("text-anchor", "middle")
    .text("Age Group");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -44)
    .attr("text-anchor", "middle")
    .text("Number of Likes");

  // Helper to compute full boxplot stats for each group
  const rollupFunction = function(groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const min = d3.min(values);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  const statsByGroup = d3.rollup(data, rollupFunction, d => d.AgeGroup);

  const boxWidth = xScale.bandwidth();

  statsByGroup.forEach((stats, AgeGroup) => {
    const cx = xScale(AgeGroup) + boxWidth / 2;

    // Whiskers (vertical line)
    svg.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", yScale(stats.min)).attr("y2", yScale(stats.max))
      .attr("stroke", "#111");

    // Min/Max caps
    const capWidth = Math.max(18, boxWidth * 0.45);
    svg.append("line")
      .attr("x1", cx - capWidth/2).attr("x2", cx + capWidth/2)
      .attr("y1", yScale(stats.min)).attr("y2", yScale(stats.min))
      .attr("stroke", "#111");
    svg.append("line")
      .attr("x1", cx - capWidth/2).attr("x2", cx + capWidth/2)
      .attr("y1", yScale(stats.max)).attr("y2", yScale(stats.max))
      .attr("stroke", "#111");

    // Box (Q1 to Q3)
    svg.append("rect")
      .attr("x", xScale(AgeGroup) + boxWidth * 0.1)
      .attr("y", yScale(stats.q3))
      .attr("width", boxWidth * 0.8)
      .attr("height", Math.max(1, yScale(stats.q1) - yScale(stats.q3)))
      .attr("fill", "#ddd")
      .attr("stroke", "#111");

    // Median line
    svg.append("line")
      .attr("x1", xScale(AgeGroup) + boxWidth * 0.1)
      .attr("x2", xScale(AgeGroup) + boxWidth * 0.9)
      .attr("y1", yScale(stats.median))
      .attr("y2", yScale(stats.median))
      .attr("stroke", "#111")
      .attr("stroke-width", 2);
  });
});

// Prepare your data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
  // Convert string values to numbers
  data.forEach(d => { d.AvgLikes = +d.AvgLikes; });

  // Define the dimensions and margins for the SVG
  const margin = { top: 24, right: 24, bottom: 58, left: 60 };
  const width = 820 - margin.left - margin.right;
  const height = 440 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define four scales
  // Scale x0 is for the platform
  const platforms = [...new Set(data.map(d => d.Platform))];
  const postTypes = [...new Set(data.map(d => d.PostType))];

  const x0 = d3.scaleBand()
    .domain(platforms)
    .range([0, width])
    .padding(0.2);

  // Scale x1 is for the post type inside each platform band
  const x1 = d3.scaleBand()
    .domain(postTypes)
    .range([0, x0.bandwidth()])
    .padding(0.15);

  // y scale
  const yMax = d3.max(data, d => d.AvgLikes);
  const y = d3.scaleLinear()
    .domain([0, yMax * 1.15])
    .nice()
    .range([height, 0]);

  // color scale for the post type
  const color = d3.scaleOrdinal()
    .domain(postTypes)
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 44)
    .attr("text-anchor", "middle")
    .text("Platform");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -46)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Group container for bars by platform
  const grouped = d3.group(data, d => d.Platform);
  const platformG = svg.selectAll(".platform-g")
    .data(platforms)
    .enter()
    .append("g")
    .attr("class", "platform-g")
    .attr("transform", d => `translate(${x0(d)},0)`);

  // Draw bars
  platformG.selectAll("rect")
    .data(d => grouped.get(d))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType))
    .append("title")
    .text(d => `${d.Platform} — ${d.PostType}: ${d.AvgLikes}`);

  // Add the legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 0)`);

  postTypes.forEach((type, i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    row.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("y", -10)
      .attr("fill", color(type));
    row.append("text")
      .attr("x", 18)
      .attr("alignment-baseline", "middle")
      .text(type);
  });
});

// Prepare your data and load the data again. 
// This data should contain two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
  // Convert string values
  data.forEach(d => {
    d.Date = d3.timeParse("%m/%d/%Y")(d.Date);
    d.AvgLikes = +d.AvgLikes;
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 24, right: 24, bottom: 60, left: 60 };
  const width = 820 - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales for x and y axes  
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes) * 1.15])
    .nice()
    .range([height, 0]);

  // Draw the axis, rotate x-axis text a bit for readability
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%-m/%-d")))
    .selectAll("text")
    .attr("transform", "rotate(0)")
    .style("text-anchor", "middle");

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 44)
    .attr("text-anchor", "middle")
    .text("Date");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -46)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Draw the line and path. Use curveNatural. 
  const line = d3.line()
    .curve(d3.curveNatural)
    .x(d => x(d.Date))
    .y(d => y(d.AvgLikes));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#111")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add simple circles at points with titles
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Date))
    .attr("cy", d => y(d.AvgLikes))
    .attr("r", 3)
    .append("title")
    .text(d => `${d3.timeFormat("%-m/%-d/%Y")(d.Date)} — ${d.AvgLikes}`);
});
