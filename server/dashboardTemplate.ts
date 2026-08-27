export const dashboardTemplate = `
  <div class="product-grid" aria-hidden="true"></div>
  <header class="shell-header" data-header="dashboard"></header>
  <section class="dashboard-wrap" aria-labelledby="dashboard-title">
    <div class="dashboard-toolbar reveal" style="--d: .03s">
      <div><p class="eyebrow"><span class="live-dot"></span><span id="stream-label">LIVE SENSOR STREAM</span></p><h1 id="dashboard-title">PredictBMS Monitor</h1></div>
      <div class="toolbar-status"><span class="micro-pill">DEMO MODE</span><span class="micro-pill is-online"><span class="tiny-dot"></span>SYSTEM ONLINE</span></div>
    </div>
    <section class="dashboard-top-grid">
      <article class="panel battery-panel reveal" style="--d: .08s"><p class="panel-kicker">BATTERY STATUS</p><div class="state-line"><span class="state-dot" id="battery-dot"></span><strong id="battery-state">NORMAL</strong></div><p id="battery-message">Battery behavior is currently within the learned operating pattern.</p></article>
      <article class="panel risk-panel reveal" style="--d: .13s" aria-live="polite"><p class="panel-kicker">PREDICTIVE RISK</p><div class="risk-number"><output id="risk-score">12</output><span>/ 100</span></div><p class="risk-interpretation" id="risk-interpretation">LOW RISK</p></article>
      <article class="panel alert-panel reveal" style="--d: .18s"><p class="panel-kicker">LOCAL ALERT</p><div class="alert-state" id="alert-state"><span class="tiny-dot"></span><span>STANDBY</span></div><div class="alert-lines"><span>● BUZZER</span><span>● LED</span></div></article>
    </section>
    <section class="telemetry-grid" aria-label="Simulated sensor telemetry">
      <article class="panel telemetry-panel reveal" style="--d: .23s"><p class="panel-kicker">TEMPERATURE</p><strong><output id="temperature">34.8</output><span>°C</span></strong><span class="telemetry-note">Thermal sensing</span></article>
      <article class="panel telemetry-panel reveal" style="--d: .28s"><p class="panel-kicker">VOLTAGE</p><strong><output id="voltage">48.6</output><span>V</span></strong><span class="telemetry-note">Pack voltage</span></article>
      <article class="panel telemetry-panel reveal" style="--d: .33s"><p class="panel-kicker">CURRENT</p><strong><output id="current">8.2</output><span>A</span></strong><span class="telemetry-note">Load current</span></article>
    </section>
    <section class="panel behavior-panel reveal" style="--d: .38s" aria-labelledby="behavior-title">
      <div class="behavior-header"><div><p class="panel-kicker" id="behavior-title">BATTERY BEHAVIOR</p><span class="normal-range-label">LEARNED NORMAL RANGE</span></div><div class="chart-tabs" role="tablist" aria-label="Telemetry metric"><button class="chart-tab is-active" role="tab" aria-selected="true" data-series="temperature">Temperature</button><button class="chart-tab" role="tab" aria-selected="false" data-series="voltage">Voltage</button><button class="chart-tab" role="tab" aria-selected="false" data-series="current">Current</button><button class="chart-tab" role="tab" aria-selected="false" data-series="risk">Risk</button></div></div>
      <div class="chart-shell"><canvas id="behavior-chart" role="img" aria-label="Animated simulated battery telemetry within a learned normal operating range"></canvas><div class="chart-note" id="chart-note" hidden><strong>ANOMALY DETECTED</strong><span>Battery behavior is deviating from the learned normal pattern.</span><small>Risk score increasing.</small></div></div>
    </section>
    <section class="dashboard-lower-grid">
      <article class="panel sensor-panel reveal" style="--d: .43s"><p class="panel-kicker">SENSOR STATUS</p><dl class="sensor-list"><div><dt>VOLTAGE</dt><dd><span class="tiny-dot"></span>ONLINE</dd></div><div><dt>CURRENT</dt><dd><span class="tiny-dot"></span>ONLINE</dd></div><div><dt>TEMPERATURE</dt><dd><span class="tiny-dot"></span>ONLINE</dd></div><div><dt>AI MODEL</dt><dd><span class="tiny-dot"></span>ONLINE</dd></div></dl></article>
      <article class="panel demo-panel reveal" style="--d: .48s"><div><p class="panel-kicker">PREDICTIVE SEQUENCE</p><p id="demo-summary">Monitoring learned operating behavior.</p></div><div class="demo-actions"><button class="demo-button" id="run-demo" type="button">Run Predictive Demo</button><button class="reset-button" id="reset-demo" type="button" disabled>Reset</button></div></article>
    </section>
    <p class="dashboard-disclaimer reveal" style="--d: .53s">This prototype displays a simulated sensor stream for demonstration. It is intended to illustrate predictive monitoring and risk assessment, not a real vehicle telemetry connection.</p>
  </section>
  <footer class="site-footer" data-footer></footer>`;
