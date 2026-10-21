/* Econ 432 Math Toolkit — content.
   Each module has skills; each skill has a concept write-up and problems.
   Problem types: 'num' (numeric), 'expr' (algebraic expression), 'mc' (multiple choice).
   For numeric problems:
     answer(p)  -> correct value
     alts       -> other answers accepted, with a note
     errors     -> common wrong answers {v: p => value, msg: p => html}; the first match is shown
     steps(p)   -> sub-problems used by "Break it into steps"
   TeX goes inside \( \) or \[ \]; M`...` keeps backslashes intact. */
(function () {
  'use strict';
  const M = String.raw;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  // number formatting for prompts
  const f = (x, sig = 4) => {
    if (!isFinite(x)) return String(x);
    const ax = Math.abs(x);
    if (ax >= 10000) return Math.round(x).toLocaleString('en-US');
    if (ax >= 1000) return String(Math.round(x));
    return String(Number(x.toPrecision(sig)));
  };
  const fc = (x) => f(x).replace(/,/g, '{,}'); // safe inside TeX
  const pc = (x, sig = 3) => f(x * 100, sig) + '%'; // decimal -> percent text
  const ln = Math.log, exp = Math.exp, pow = Math.pow, cbrt = Math.cbrt;

  const ALPHAS = [{ v: 1 / 3, t: '1/3' }, { v: 0.3, t: '0.3' }, { v: 0.4, t: '0.4' }, { v: 0.25, t: '0.25' }];
  const atex = a => (a.t === '1/3' ? M`\tfrac{1}{3}` : a.t);

  /* ===================================================================== */
  /* MODULE 4: LOGARITHMS                                                    */
  /* ===================================================================== */

  const logsRules = {
    id: 'log-rules', title: 'The rules of logs', lectures: [3, 6, 10, 11, 14, 16],
    summary: 'Products become sums, powers become multipliers. That is why logs are everywhere in this course.',
    concept: M`
<p>The natural log, \(\ln x\), undoes the exponential function: \(\ln(e^{x}) = x\) and \(e^{\ln x} = x\). (In economics, "log" almost always means the natural log, base \(e \approx 2.718\).) Three rules do nearly all the work:</p>
<div class="rulebox">\[\ln(xy) = \ln x + \ln y \qquad \ln\!\left(\frac{x}{y}\right) = \ln x - \ln y \qquad \ln(x^{a}) = a\,\ln x\]</div>
<p>In words: <b>products become sums, ratios become differences, and exponents come down in front as multipliers.</b> There is no rule for the log of a sum: \(\ln(x+y)\) does not simplify.</p>
<div class="example"><div class="tag">From Lecture 3 · Quantifying the Solow model</div>
<p>Take logs of the Cobb-Douglas production function \(Y = A K^{\alpha} L^{1-\alpha}\). It is a product of three pieces, so its log is a sum of three logs, and each exponent comes down in front:</p>
\[\ln Y = \ln A + \alpha \ln K + (1-\alpha)\ln L\]
<p>The curved function becomes a straight line in logs, and the exponents become the coefficients. That is why we can read \(\alpha\) as an elasticity (Module 6) and why growth accounting is just subtraction (Lecture 11).</p></div>`,
    problems: [
      {
        id: 'lr1', type: 'num',
        gen: () => ({ a0: pick([0.2, 0.4, 0.5, 0.7, 1]), k0: pick([3, 4.5, 6, 7.5]), l0: pick([1.5, 2, 3, 4]), al: pick(ALPHAS) }),
        prompt: p => M`<p>Output is \(Y = A K^{\alpha} L^{1-\alpha}\) with \(\alpha = ${atex(p.al)}\). You know that \(\ln A = ${p.a0}\), \(\ln K = ${p.k0}\) and \(\ln L = ${p.l0}\).</p><p>What is \(\ln Y\)?</p>`,
        answer: p => p.a0 + p.al.v * p.k0 + (1 - p.al.v) * p.l0,
        errors: [
          { v: p => p.a0 + p.k0 + p.l0, msg: p => M`You added the three logs but dropped the exponents. By the power rule, \(\ln(K^{\alpha}) = \alpha \ln K\): the exponent comes down in front as a multiplier, so \(\ln K\) gets weight \(\alpha\) and \(\ln L\) gets weight \(1-\alpha\).` },
          { v: p => p.a0 * p.al.v * p.k0 * (1 - p.al.v) * p.l0, msg: p => M`Logs turn products into <i>sums</i>. \(\ln(A\cdot K^{\alpha}\cdot L^{1-\alpha}) = \ln A + \ln(K^{\alpha}) + \ln(L^{1-\alpha})\), so add the pieces rather than multiplying them.` },
          { v: p => p.a0 + (1 - p.al.v) * p.k0 + p.al.v * p.l0, msg: p => M`You swapped the exponents. Capital's exponent is \(\alpha\) and labor's is \(1-\alpha\).` },
          { v: p => p.al.v * p.k0 + (1 - p.al.v) * p.l0, msg: p => M`Don't forget \(\ln A\). It is one of the three pieces of the product.` },
          { v: p => exp(p.a0 + p.al.v * p.k0 + (1 - p.al.v) * p.l0), msg: p => M`That's \(Y\) itself. The question asks for \(\ln Y\), so stop before exponentiating.` }
        ],
        hint: p => M`Split the product into its three pieces, take the log of each piece, and add. The power rule \(\ln(x^{a}) = a\ln x\) handles the exponents.`,
        steps: p => [
          { prompt: M`What is \(\ln(K^{\alpha}) = \alpha \ln K\)?`, answer: () => p.al.v * p.k0, errors: [{ v: () => p.k0, msg: p => M`Multiply \(\ln K\) by \(\alpha = ${atex(p.al)}\).` }], hint: p => M`Multiply \(${atex(p.al)} \times ${p.k0}\).` },
          { prompt: M`What is \(\ln(L^{1-\alpha}) = (1-\alpha)\ln L\)?`, answer: () => (1 - p.al.v) * p.l0, errors: [{ v: () => p.al.v * p.l0, msg: p => M`Labor's exponent is \(1-\alpha\), not \(\alpha\).` }], hint: p => M`\(1-\alpha = ${f(1 - p.al.v)}\); multiply by \(${p.l0}\).` },
          { prompt: M`Add \(\ln A\) and the two pieces you just found.`, answer: () => p.a0 + p.al.v * p.k0 + (1 - p.al.v) * p.l0, hint: p => M`\(${p.a0} + ${f(p.al.v * p.k0)} + ${f((1 - p.al.v) * p.l0)}\)` }
        ],
        solution: p => M`<p>\(\ln Y = \ln A + \alpha\ln K + (1-\alpha)\ln L = ${p.a0} + ${atex(p.al)}(${p.k0}) + ${f(1 - p.al.v)}(${p.l0}) = ${f(p.a0)} + ${f(p.al.v * p.k0)} + ${f((1 - p.al.v) * p.l0)} = ${f(p.a0 + p.al.v * p.k0 + (1 - p.al.v) * p.l0)}\)</p>`
      },
      {
        id: 'lr2', type: 'expr', label: 'Algebra',
        prompt: p => M`<p>Output per worker is \(y = A\,k^{\alpha}\). Take natural logs: write \(\ln y\) in terms of \(\ln A\), \(\ln k\) and \(\alpha\).</p><p>Type logs as <code>ln(A)</code> and <code>ln(k)</code>, and \(\alpha\) as <code>alpha</code>.</p>`,
        vars: { A: [0.5, 3], k: [0.5, 6], alpha: [0.15, 0.85] }, atomicLogs: true,
        answer: 'ln(A) + alpha*ln(k)', placeholder: 'e.g. ln(A) + ...',
        errors: [
          { e: 'ln(A) + ln(k)', msg: M`The \(\alpha\) is missing. By the power rule, \(\ln(k^{\alpha}) = \alpha\ln k\).` },
          { e: 'ln(A)*alpha*ln(k)', msg: M`Logs turn the product \(A\cdot k^{\alpha}\) into a <i>sum</i>: \(\ln A + \ln(k^{\alpha})\).` },
          { e: 'ln(A) + ln(k)^alpha', msg: M`The exponent comes down in front as a multiplier: \(\ln(k^{\alpha}) = \alpha \ln k\), not \((\ln k)^{\alpha}\).` },
          { e: 'alpha*ln(A) + alpha*ln(k)', msg: M`The exponent \(\alpha\) applies only to \(k\), so \(\ln A\) keeps a coefficient of 1.` },
          { e: 'ln(A) - alpha*ln(k)', msg: M`Check the sign. Multiplying by \(k^{\alpha}\) adds \(\alpha\ln k\).` }
        ],
        hint: p => M`Two rules: \(\ln(xy) = \ln x + \ln y\), then \(\ln(k^{\alpha}) = \alpha\ln k\).`,
        solution: p => M`<p>\(\ln y = \ln(A\cdot k^{\alpha}) = \ln A + \ln(k^{\alpha}) = \ln A + \alpha\ln k\). Type it as <code>ln(A) + alpha*ln(k)</code>.</p>`
      },
      {
        id: 'lr3', type: 'mc',
        prompt: p => M`<p>Which of these is a correct log rule?</p>`,
        options: () => [
          { t: M`\(\ln(K/L) = \ln K - \ln L\)`, ok: true, why: M`Division becomes subtraction. This is why \(\ln(Y/L) = \ln Y - \ln L\): output per worker in logs is just the difference of two logs.` },
          { t: M`\(\ln(K+L) = \ln K + \ln L\)`, why: M`The sum rule is for products: \(\ln(KL) = \ln K + \ln L\). The log of a sum doesn't simplify. Test it with \(K = L = 1\): \(\ln 2 = 0.69\), but \(\ln 1 + \ln 1 = 0\).` },
          { t: M`\(\ln(K^{\alpha}) = (\ln K)^{\alpha}\)`, why: M`The exponent comes down in front as a multiplier: \(\ln(K^{\alpha}) = \alpha\ln K\).` },
          { t: M`\(\ln(AK) = \ln A \cdot \ln K\)`, why: M`Logs turn products into sums, not into products of logs: \(\ln(AK) = \ln A + \ln K\).` }
        ]
      },
      {
        id: 'lr4', type: 'num',
        gen: () => ({ L: pick([0.7, 1.5, 2, 2.3, 3, 4.6]) }),
        prompt: p => M`<p>Undo a log. If \(\ln y = ${p.L}\), what is \(y\)?</p>`,
        answer: p => exp(p.L),
        errors: [
          { v: p => pow(10, p.L), msg: p => M`That's \(10^{x}\), which undoes the base-10 log. Here "ln" is the natural log, so undo it with \(e^{x}\) (the <code>exp</code> or \(e^x\) key).` },
          { v: p => ln(p.L), msg: p => M`You took the log a second time. To undo \(\ln\), exponentiate: \(y = e^{\ln y}\).` },
          { v: p => p.L * Math.E, msg: p => M`Close idea, wrong operation: \(e\) goes in the base and \(${p.L}\) in the exponent, so \(y = e^{${p.L}}\), not \(e \times ${p.L}\).` }
        ],
        hint: p => M`\(\ln\) and \(e^{x}\) undo each other: \(y = e^{\ln y} = e^{${p.L}}\).`,
        solution: p => M`<p>\(y = e^{${p.L}} = ${f(exp(p.L))}\).</p>`
      }
    ]
  };

  const logsGrowth = {
    id: 'log-growth', title: 'Growth rates and compounding', lectures: [1, 2, 3, 11, 20],
    summary: 'Use logs to find an average growth rate, project forward and compute doubling times.',
    concept: M`
<p>If something grows at rate \(g\) per year for \(n\) years, growth compounds:</p>
<div class="rulebox">\[Y_{t+n} = Y_t\,(1+g)^{n}\]</div>
<p>Logs turn the compounding into multiplication by \(n\):</p>
<div class="rulebox">\[\ln\!\left(\frac{Y_{t+n}}{Y_t}\right) = n\,\ln(1+g) \approx n\,g\]</div>
<p>The approximation \(\ln(1+g) \approx g\) is very good for small rates (\(\ln 1.02 = 0.0198\)) and gets worse as rates grow (\(\ln 1.5 = 0.405\)).</p>
<p><b>Finding the average growth rate from two data points</b> is the same calculation run backwards: take the log of the ratio, divide by \(n\) to get \(\ln(1+g)\), then exponentiate and subtract 1:</p>
<div class="rulebox">\[g = \exp\!\left(\frac{1}{n}\ln\frac{Y_{t+n}}{Y_t}\right) - 1\]</div>
<p><b>Doubling time.</b> Set \((1+g)^{n} = 2\) and take logs: \(n = \ln 2/\ln(1+g) \approx 0.693/g\). This is the "rule of 70": at 2% a year, income doubles in about 35 years.</p>
<div class="example"><div class="tag">From Lecture 2 · The Solow model</div>
<p>China's income per person went from $1,240 in 1980 to $8,880 in 2010. The spreadsheet computes \(\ln(8880/1240) = 1.969\), divides by 30 to get \(0.0656 = \ln(1+g)\), and exponentiates: \(1+g = 1.0678\). So China grew at 6.8% a year. Mexico grew at 0.6% a year over the same period.</p></div>`,
    problems: [
      {
        id: 'lg1', type: 'num', unit: 'pct', tol: { abs: 0.03, rel: 0.004 },
        gen: () => pick([
          { who: 'China', y0: 1240, y1: 8880, t0: 1980, t1: 2010 },
          { who: 'Mexico', y0: 5120, y1: 15100, t0: 1950, t1: 1980 },
          { who: 'China', y0: 931, y1: 1240, t0: 1950, t1: 1980 },
          { who: 'Mexico', y0: 15100, y1: 18000, t0: 1980, t1: 2010 },
          { who: 'Country A', y0: 2000, y1: 9800, t0: 1985, t1: 2015 },
          { who: 'Country B', y0: 3500, y1: 21000, t0: 1975, t1: 2015 }
        ]),
        prompt: p => M`<p>${p.who}'s real income per person was $${f(p.y0)} in ${p.t0} and $${f(p.y1)} in ${p.t1}.</p><p>What was its average annual growth rate, with compounding? Enter a percent.</p>`,
        answer: p => (exp(ln(p.y1 / p.y0) / (p.t1 - p.t0)) - 1) * 100,
        errors: [
          { v: p => (p.y1 / p.y0 - 1) / (p.t1 - p.t0) * 100, msg: p => M`You divided the total percent change by ${p.t1 - p.t0} years. That ignores compounding: each year's growth builds on a bigger base, so the true annual rate is lower. Use logs: \(\ln(1+g) = \frac{1}{n}\ln(Y_{1}/Y_{0})\).` },
          { v: p => ln(p.y1 / p.y0) / (p.t1 - p.t0) * 100, msg: p => M`You have \(\ln(1+g) = ${f(ln(p.y1 / p.y0) / (p.t1 - p.t0))}\), the average <i>log</i> growth rate. That's a good approximation, and it's exactly the spreadsheet step before <code>EXP</code>. To get \(g\) itself, exponentiate and subtract 1.` },
          { v: p => (p.y1 / p.y0 - 1) * 100, msg: p => M`That's the total growth over all ${p.t1 - p.t0} years. Convert it to an annual rate: take logs, divide by \(n\), then exponentiate.` },
          { v: p => pow(p.y1 / p.y0, 1 / (p.t1 - p.t0)) * 100, msg: p => M`That's \(1+g\) written as a percent. Subtract 1 before converting.` }
        ],
        hint: p => M`Three moves: \(\ln(Y_1/Y_0)\), divide by the number of years, then \(e^{(\cdot)} - 1\).`,
        steps: p => {
          const n = p.t1 - p.t0, r = p.y1 / p.y0;
          return [
            { prompt: M`What is the growth factor \(Y_{${p.t1}}/Y_{${p.t0}}\)?`, answer: () => r, errors: [{ v: () => p.y1 - p.y0, msg: p => 'Divide, don’t subtract. Growth rates come from ratios.' }, { v: () => 1 / r, msg: p => 'Flip it: the later year goes on top.' }], hint: p => M`\(${f(p.y1)}/${f(p.y0)}\)` },
            { prompt: M`Take the natural log of that ratio.`, answer: () => ln(r), errors: [{ v: () => Math.log10(r), msg: p => 'That’s log base 10. Use the natural log, ln.' }], hint: p => M`\(\ln(${f(r)})\)` },
            { prompt: M`Divide by the number of years, \(n = ${n}\). This is \(\ln(1+g)\).`, answer: () => ln(r) / n, hint: p => M`\(${f(ln(r))}/${n}\)` },
            { prompt: M`Now undo the log: \(g = e^{\ln(1+g)} - 1\). Enter \(g\) as a percent.`, unit: 'pct', tol: { abs: 0.03 }, answer: () => (exp(ln(r) / n) - 1) * 100, errors: [{ v: () => exp(ln(r) / n) * 100, msg: p => 'That’s 1 + g. Subtract 1.' }], hint: p => M`\(e^{${f(ln(r) / n)}} = ${f(exp(ln(r) / n), 5)}\)` }
          ];
        },
        solution: p => {
          const n = p.t1 - p.t0, r = p.y1 / p.y0;
          return M`<p>\(\ln(${f(p.y1)}/${f(p.y0)}) = \ln(${f(r)}) = ${f(ln(r))}\). Dividing by ${n} gives \(\ln(1+g) = ${f(ln(r) / n)}\). So \(1+g = e^{${f(ln(r) / n)}} = ${f(exp(ln(r) / n), 5)}\), and \(g = ${f((exp(ln(r) / n) - 1) * 100, 3)}\%\) per year.</p>`;
        }
      },
      {
        id: 'lg2', type: 'num', tol: { rel: 0.01 },
        prompt: p => M`<p>From Lecture 2: China's income per person grew from $1,240 in 1980 to $8,880 in 2010. Mexico's was $15,100 in 1980.</p><p>If Mexico had grown at China's rate from 1980 to 2010, what would Mexico's income per person have been in 2010?</p>`,
        answer: () => 15100 * 8880 / 1240,
        errors: [
          { v: () => 15100 * (1 + 30 * (pow(8880 / 1240, 1 / 30) - 1)), msg: p => M`That treats growth as simple interest (\(1 + 30g\)). Growth compounds: Mexico's income gets multiplied by \((1+g)^{30}\).` },
          { v: () => 15100 + (8880 - 1240), msg: p => M`China's <i>dollar</i> gain doesn't carry over. What carries over is the growth <i>factor</i>: incomes get multiplied, not added to.` },
          { v: () => 15100 * pow(8880 / 1240, 1 / 30), msg: p => M`That's only one year of China's growth. Apply all 30 years: multiply by \((1+g)^{30}\).` },
          { v: () => 15100 * 8880 / 1240 / 30, msg: p => M`No need to divide by 30. Thirty years at China's annual rate multiplies income by China's full 30-year growth factor, \(8880/1240\).` }
        ],
        hint: p => M`You don't need \(g\) itself. Thirty years of growth at China's rate multiplies income by \((1+g)^{30}\), and for China that factor is \(8880/1240\).`,
        steps: () => [
          { prompt: M`What is China's 30-year growth factor, \((1+g)^{30} = 8880/1240\)?`, answer: () => 8880 / 1240, hint: p => 'Divide 8,880 by 1,240.' },
          { prompt: M`Apply that factor to Mexico's 1980 income of $15,100.`, answer: () => 15100 * 8880 / 1240, tol: { rel: 0.01 }, hint: p => M`\(15100 \times 7.161\)` }
        ],
        solution: p => M`<p>\(Y_{2010} = 15{,}100 \times (1+g_{China})^{30} = 15{,}100 \times \frac{8880}{1240} = 15{,}100 \times 7.161 \approx \$108{,}000\), about six times Mexico's actual 2010 income of $18,000. The spreadsheet does this as <code>=C3*G2^30</code>.</p>`
      },
      {
        id: 'lg3', type: 'num',
        gen: () => ({ g: pick([0.02, 0.05, 0.1, 0.25, 0.5]) }),
        prompt: p => M`<p>How good is the approximation \(\ln(1+g) \approx g\)? Compute \(\ln(1+g)\) exactly for \(g = ${p.g}\).</p>`,
        answer: p => ln(1 + p.g),
        errors: [
          { v: p => p.g, msg: p => M`That's the approximation itself. Compute \(\ln(${f(1 + p.g)})\) on a calculator and compare it with \(${p.g}\).` },
          { v: p => Math.log10(1 + p.g), msg: p => M`That's the base-10 log. Use the natural log (<code>ln</code>).` },
          { v: p => ln(p.g), msg: p => M`Take the log of \(1+g\), not of \(g\).` }
        ],
        after: 'Compare it with g. The gap is roughly g²/2: tiny at 2%, sizable at 25% or more. That is why log changes stand in for percent changes only when changes are small.',
        hint: p => M`Type <code>ln(${f(1 + p.g)})</code> into a calculator.`,
        solution: p => M`<p>\(\ln(${f(1 + p.g)}) = ${f(ln(1 + p.g))}\) versus \(g = ${p.g}\). The approximation is off by \(${f(p.g - ln(1 + p.g), 2)}\), about \(g^2/2 = ${f(p.g * p.g / 2, 2)}\).</p>`
      },
      {
        id: 'lg4', type: 'num', tol: { abs: 0.15, rel: 0.005 }, unitNote: 'Answer in years. About 3 significant digits is fine.',
        gen: () => ({ g: pick([1, 2, 3.5, 5, 7]) }),
        prompt: p => M`<p>Income per person grows at ${p.g}% a year. Exactly how many years does it take to double?</p>`,
        answer: p => ln(2) / ln(1 + p.g / 100),
        alts: [{ v: p => 70 / p.g, msg: p => M`That's the rule of 70, which is a great approximation. The exact answer is \(\ln 2/\ln(${f(1 + p.g / 100, 5)}) = ${f(ln(2) / ln(1 + p.g / 100))}\) years.` }],
        errors: [
          { v: p => 100 / p.g, msg: p => M`At ${p.g}% simple interest it would take ${f(100 / p.g)} years to add 100%. But growth compounds, so doubling comes sooner. Solve \((1+g)^{n} = 2\) with logs.` },
          { v: p => 2 / (p.g / 100), msg: p => M`Solve \((1+g)^{n} = 2\) by taking logs of both sides: \(n\ln(1+g) = \ln 2\).` },
          { v: p => ln(2) / (p.g), msg: p => M`Right idea, but put \(g\) in as a decimal: ${''}use \(\ln(1+g)\) with \(g\) written like 0.03, not 3.` }
        ],
        hint: p => M`Set \((1+g)^{n} = 2\). Take logs: \(n\,\ln(1+g) = \ln 2\). Solve for \(n\).`,
        steps: p => [
          { prompt: M`What is \(\ln 2\)?`, answer: () => ln(2), hint: p => 'Type ln(2) into a calculator.' },
          { prompt: M`What is \(\ln(1+g)\) for \(g = ${f(p.g / 100)}\)?`, answer: () => ln(1 + p.g / 100), errors: [{ v: () => ln(1 + p.g), msg: p => M`Use the decimal: \(1 + ${f(p.g / 100)}\).` }], hint: p => M`\(\ln(${f(1 + p.g / 100, 5)})\)` },
          { prompt: M`Divide to get \(n\).`, answer: () => ln(2) / ln(1 + p.g / 100), tol: { abs: 0.15 }, hint: p => M`\(0.6931 / ${f(ln(1 + p.g / 100))}\)` }
        ],
        solution: p => M`<p>\(n = \ln 2/\ln(${f(1 + p.g / 100, 5)}) = 0.6931/${f(ln(1 + p.g / 100))} = ${f(ln(2) / ln(1 + p.g / 100))}\) years. The rule of 70 gives \(70/${p.g} = ${f(70 / p.g)}\).</p>`
      }
    ]
  };

  const logsDiffs = {
    id: 'log-differences', title: 'Log differences as percent changes', lectures: [3, 6, 11, 20],
    summary: 'A change in logs is (about) a percent change, and log changes add up where percents don’t.',
    concept: M`
<p>The difference of two logs is the log of a ratio, and for small changes it is close to the percent change:</p>
<div class="rulebox">\[\ln x_1 - \ln x_0 = \ln\frac{x_1}{x_0} \approx \frac{x_1 - x_0}{x_0}\]</div>
<p>Economists call \(100\times\) a log difference "log points." For changes under about 10%, log points and percent are nearly the same. For bigger changes, convert exactly: \(x_1/x_0 = e^{\Delta \ln x}\), so the percent change is \(e^{\Delta\ln x} - 1\).</p>
<p>Log changes have one big advantage: they <b>add up</b>. Going up 50% and then up another 50% is not up 100% (it's up 125%), but the log changes do add: \(0.405 + 0.405 = 0.811\), and \(e^{0.811} - 1 = 1.25\).</p>
<div class="example"><div class="tag">From Lecture 3 · Quantifying the Solow model</div>
<p>With \(\alpha = 1/3\), steady-state income satisfies \(\ln y_{ss} = 1.5\ln A + 0.5\ln\gamma - 0.5\ln(n+\delta)\). If population growth rises from 2% to 4% with \(\delta = 0.10\):</p>
\[\Delta\ln y_{ss} = -0.5\,\ln\frac{0.14}{0.12} = -0.5\times 0.154 = -0.077\]
<p>So steady-state income falls by about 7.7% (exactly, \(e^{-0.077} - 1 = -7.4\%\)).</p></div>`,
    problems: [
      {
        id: 'ld1', type: 'num',
        gen: () => { const x0 = pick([80, 100, 120, 200, 250]); const g = pick([0.04, 0.1, 0.25, 0.5]); return { x0, g, x1: x0 * (1 + g) }; },
        prompt: p => M`<p>A price index rises from ${f(p.x0)} to ${f(p.x1)}. Compute the log difference \(\ln x_1 - \ln x_0\).</p>`,
        answer: p => ln(p.x1 / p.x0),
        errors: [
          { v: p => p.g, msg: p => M`That's the percent change, \((x_1 - x_0)/x_0 = ${p.g}\). The log difference is close to it for small changes, but it isn't the same number. Compute \(\ln(${f(p.x1)}) - \ln(${f(p.x0)})\).` },
          { v: p => p.x1 - p.x0, msg: p => M`That's the raw difference in levels. Take the log of each level first, then subtract.` },
          { v: p => ln(p.x1 - p.x0), msg: p => M`Take the log of each level and then subtract, not the log of the difference.` },
          { v: p => ln(p.x1) / ln(p.x0), msg: p => M`Subtract the logs rather than dividing them: \(\ln x_1 - \ln x_0 = \ln(x_1/x_0)\).` }
        ],
        hint: p => M`\(\ln x_1 - \ln x_0 = \ln(x_1/x_0)\).`,
        solution: p => M`<p>\(\ln(${f(p.x1)}/${f(p.x0)}) = \ln(${f(1 + p.g)}) = ${f(ln(1 + p.g))}\), compared with a percent change of \(${f(p.g * 100)}\%\). ${p.g >= 0.25 ? 'At this size, the two differ noticeably.' : 'At this size, the two are close.'}</p>`
      },
      {
        id: 'ld2', type: 'num', unit: 'pct', tol: { abs: 0.05, rel: 0.005 },
        gen: () => { const n0 = pick([0.01, 0.02]); const n1 = n0 + pick([0.01, 0.02, 0.03]); const d = pick([0.05, 0.08, 0.1]); return { n0, n1, d }; },
        prompt: p => M`<p>In the Solow model with \(\alpha = 1/3\),</p>\[\ln y_{ss} = 1.5\ln A + 0.5\ln\gamma - 0.5\ln(n+\delta).\]<p>Population growth rises from \(n = ${p.n0}\) to \(n = ${f(p.n1)}\), and depreciation is \(\delta = ${p.d}\). Using the log difference, by about what percent does steady-state income per worker change? (Use a minus sign for a fall.)</p>`,
        answer: p => -0.5 * ln((p.n1 + p.d) / (p.n0 + p.d)) * 100,
        alts: [{ v: p => (pow((p.n1 + p.d) / (p.n0 + p.d), -0.5) - 1) * 100, msg: p => M`That's the exact percent change, \(e^{\Delta\ln y} - 1\). It's also correct. The log approximation gives \(${f(-0.5 * ln((p.n1 + p.d) / (p.n0 + p.d)) * 100, 3)}\%\).` }],
        errors: [
          { v: p => -ln((p.n1 + p.d) / (p.n0 + p.d)) * 100, msg: p => M`You left out the 0.5. The term enters as \(-0.5\ln(n+\delta)\), because the exponent on \(\gamma/(n+\delta)\) in \(y_{ss}\) is \(\alpha/(1-\alpha) = 0.5\).` },
          { v: p => -0.5 * ln(p.n1 / p.n0) * 100, msg: p => M`Population growth and depreciation enter <i>together</i> as \(n+\delta\). Compare \(n_1+\delta\) with \(n_0+\delta\), not \(n_1\) with \(n_0\).` },
          { v: p => -1.5 * ln((p.n1 + p.d) / (p.n0 + p.d)) * 100, msg: p => M`1.5 is the exponent on \(A\). The coefficient on \(\ln(n+\delta)\) is \(-0.5\).` },
          { v: p => -0.5 * (p.n1 - p.n0) * 100, msg: p => M`You used the change in \(n\) itself (in percentage points). The model needs the <i>log</i> change in \(n+\delta\).` }
        ],
        hint: p => M`Only the last term changes, so \(\Delta \ln y_{ss} = -0.5\,[\ln(n_1+\delta) - \ln(n_0+\delta)]\).`,
        steps: p => [
          { prompt: M`What are \(n_0+\delta\) and \(n_1+\delta\)? Enter their ratio \((n_1+\delta)/(n_0+\delta)\).`, answer: () => (p.n1 + p.d) / (p.n0 + p.d), errors: [{ v: () => p.n1 / p.n0, msg: p => M`Add \(\delta\) to each before dividing.` }], hint: p => M`\((${f(p.n1)}+${p.d})/(${p.n0}+${p.d}) = ${f(p.n1 + p.d)}/${f(p.n0 + p.d)}\)` },
          { prompt: M`Take the natural log of that ratio.`, answer: () => ln((p.n1 + p.d) / (p.n0 + p.d)), hint: p => M`\(\ln(${f((p.n1 + p.d) / (p.n0 + p.d))})\)` },
          { prompt: M`Multiply by \(-0.5\) and by 100 to get percent.`, unit: 'pct', tol: { abs: 0.05 }, answer: () => -0.5 * ln((p.n1 + p.d) / (p.n0 + p.d)) * 100, hint: p => M`\(-0.5 \times ${f(ln((p.n1 + p.d) / (p.n0 + p.d)))} \times 100\)` }
        ],
        solution: p => M`<p>\(\Delta\ln y_{ss} = -0.5\ln\frac{${f(p.n1 + p.d)}}{${f(p.n0 + p.d)}} = -0.5 \times ${f(ln((p.n1 + p.d) / (p.n0 + p.d)))} = ${f(-0.5 * ln((p.n1 + p.d) / (p.n0 + p.d)))}\), so income per worker falls by about \(${f(0.5 * ln((p.n1 + p.d) / (p.n0 + p.d)) * 100, 3)}\%\).</p>`
      },
      {
        id: 'ld3', type: 'num', unit: 'pct', tol: { abs: 0.1, rel: 0.004 },
        gen: () => ({ D: pick([0.2, 0.4, 0.7, 1, 1.6]) }),
        prompt: p => M`<p>In development accounting (Lecture 11) we compare countries in logs. Suppose the log difference in income per worker between two countries is \(${p.D}\).</p><p>Exactly how many percent richer is the richer country?</p>`,
        answer: p => (exp(p.D) - 1) * 100,
        errors: [
          { v: p => p.D * 100, msg: p => M`Reading a log difference as a percent only works for small gaps. At \(${p.D}\) it understates a lot: the exact ratio is \(e^{${p.D}} = ${f(exp(p.D))}\).` },
          { v: p => (1 - exp(-p.D)) * 100, msg: p => M`That's how much <i>poorer</i> the poor country is, as a percent of the rich country's income. The question asks how much richer the rich one is, which is \(e^{\Delta} - 1\).` },
          { v: p => exp(p.D) * 100, msg: p => M`That's the income ratio written as a percent. Subtract 1 (that is, 100%) to get how much <i>more</i>.` }
        ],
        hint: p => M`The income ratio is \(e^{${p.D}}\). "Percent richer" is that ratio minus 1.`,
        solution: p => M`<p>\(y_1/y_2 = e^{${p.D}} = ${f(exp(p.D))}\), so the richer country is \(${f((exp(p.D) - 1) * 100, 3)}\%\) richer. The rough reading of \(${f(p.D * 100)}\%\) is ${p.D > 0.3 ? 'far' : 'a bit'} off.</p>`
      },
      {
        id: 'ld4', type: 'num', unit: 'pct', tol: { abs: 0.1 },
        gen: () => ({ q: pick([20, 30, 50, 100]) }),
        prompt: p => M`<p>Country A's income is ${p.q}% higher than country B's, and B's is ${p.q}% higher than C's. How many percent higher is A's income than C's?</p>`,
        answer: p => (pow(1 + p.q / 100, 2) - 1) * 100,
        errors: [
          { v: p => 2 * p.q, msg: p => M`Percent changes don't add, they multiply: \(${f(1 + p.q / 100)}\times${f(1 + p.q / 100)} = ${f(pow(1 + p.q / 100, 2))}\). Log changes are what add: \(2\ln(${f(1 + p.q / 100)}) = ${f(2 * ln(1 + p.q / 100))}\), and \(e^{${f(2 * ln(1 + p.q / 100))}} = ${f(pow(1 + p.q / 100, 2))}\).` },
          { v: p => pow(1 + p.q / 100, 2) * 100, msg: p => M`That's the ratio as a percent. Subtract 100% to get how much higher.` }
        ],
        hint: p => M`Chain the ratios: \(\frac{y_A}{y_C} = \frac{y_A}{y_B}\cdot\frac{y_B}{y_C} = ${f(1 + p.q / 100)}\times ${f(1 + p.q / 100)}\).`,
        solution: p => M`<p>\(y_A/y_C = ${f(1 + p.q / 100)}^2 = ${f(pow(1 + p.q / 100, 2))}\), so A is \(${f((pow(1 + p.q / 100, 2) - 1) * 100)}\%\) higher. In logs: \(\ln ${f(1 + p.q / 100)} + \ln ${f(1 + p.q / 100)} = ${f(2 * ln(1 + p.q / 100))}\).</p>`
      }
    ]
  };

  const logsSlopes = {
    id: 'log-linear', title: 'Reading log-linear equations', lectures: [6, 10, 16, 17, 28],
    summary: 'In log-log equations the slope is an elasticity; in semi-log equations it is a percent per unit.',
    concept: M`
<p>Many equations in this course are linear in logs. How you read the slope depends on which side is in logs:</p>
<ul>
<li><b>Log-log:</b> \(\ln y = c + b\ln x\). A 1% rise in \(x\) raises \(y\) by about \(b\)%. The slope \(b\) is an <b>elasticity</b>. Examples: CES demand, \(\ln q_i = \text{const} - \sigma\ln p_i\) (Lecture 16), and learning curves (Lecture 28).</li>
<li><b>Semi-log:</b> \(\ln y = a + b\,x\). One more unit of \(x\) raises \(y\) by about \(100\,b\)%; exactly, by \(e^{b} - 1\). Example: the Mincer wage equation, \(\ln w = a + b\,S\) (Lecture 10).</li>
</ul>
<p>To get back from logs to levels, exponentiate: \(\ln(y_1/y_0) = 0.4\) means \(y_1/y_0 = e^{0.4} = 1.49\).</p>
<div class="example"><div class="tag">From Lecture 16 · Consumer variety</div>
<p>CES demand implies \(\ln(q_i/q_j) = -\sigma\ln(p_i/p_j)\). Because everything else cancels in the ratio, the slope of relative quantity on relative price is \(-\sigma\). That is how the elasticity of substitution is estimated from data.</p></div>`,
    problems: [
      {
        id: 'ls1', type: 'num', unit: 'pct', tol: { abs: 0.1, rel: 0.004 },
        gen: () => ({ b: pick([0.068, 0.101, 0.134]), yrs: pick([2, 3, 4]) }),
        prompt: p => M`<p>A Mincer regression (Lecture 10) estimates \(\ln w = a + ${p.b}\,S\), where \(S\) is years of schooling.</p><p>How many percent higher is the wage of a worker with ${p.yrs} more years of schooling? Give the exact answer the equation implies.</p>`,
        answer: p => (exp(p.b * p.yrs) - 1) * 100,
        alts: [{ v: p => (pow(1 + p.b, p.yrs) - 1) * 100, msg: p => M`You compounded \((1+b)\) for each year, as the lecture slides do. That's the usual shortcut. Strictly, the semi-log equation implies \(e^{b\cdot ${p.yrs}} - 1 = ${f((exp(p.b * p.yrs) - 1) * 100, 3)}\%\); the two are close because \(b\) is small.` }],
        errors: [
          { v: p => p.b * p.yrs * 100, msg: p => M`\(${f(p.b * p.yrs)}\) is the change in <i>log</i> wages. Read as a percent it's an approximation that understates the gap. Exponentiate: \(w_1/w_0 = e^{${f(p.b * p.yrs)}}\).` },
          { v: p => p.b * 100, msg: p => M`That's the effect of <i>one</i> year. The question asks about ${p.yrs} years.` },
          { v: p => (exp(p.b) - 1) * 100, msg: p => M`That's one extra year. Do ${p.yrs} years: \(e^{${p.b}\times ${p.yrs}} - 1\).` },
          { v: p => exp(p.b * p.yrs) * 100, msg: p => M`That's the wage ratio as a percent. Subtract 100%.` }
        ],
        hint: p => M`The log wage rises by \(${p.b}\times ${p.yrs}\). Turn that log change into a ratio with \(e^{(\cdot)}\).`,
        steps: p => [
          { prompt: M`By how much does \(\ln w\) rise with ${p.yrs} more years?`, answer: () => p.b * p.yrs, errors: [{ v: () => p.b, msg: p => 'Multiply by the number of years.' }], hint: p => M`\(${p.b}\times${p.yrs}\)` },
          { prompt: M`What is the wage ratio \(w_1/w_0 = e^{\Delta\ln w}\)?`, answer: () => exp(p.b * p.yrs), hint: p => M`\(e^{${f(p.b * p.yrs)}}\)` },
          { prompt: M`Convert to "percent higher."`, unit: 'pct', tol: { abs: 0.1 }, answer: () => (exp(p.b * p.yrs) - 1) * 100, hint: p => 'Subtract 1 and multiply by 100.' }
        ],
        solution: p => M`<p>\(\Delta\ln w = ${p.b}\times${p.yrs} = ${f(p.b * p.yrs)}\). So \(w_1/w_0 = e^{${f(p.b * p.yrs)}} = ${f(exp(p.b * p.yrs))}\), which is \(${f((exp(p.b * p.yrs) - 1) * 100, 3)}\%\) higher. The quick reading of \(${f(p.b * p.yrs * 100)}\%\) understates it.</p>`
      },
      {
        id: 'ls2', type: 'num',
        gen: () => ({ s: pick([2, 4, 5]), r: pick([0.1, 0.2, 0.25]) }),
        prompt: p => M`<p>With CES demand, \(\ln(q_i/q_j) = -\sigma\,\ln(p_i/p_j)\). Let \(\sigma = ${p.s}\). Variety \(i\) costs ${f(p.r * 100)}% more than variety \(j\).</p><p>What is the quantity ratio \(q_i/q_j\)?</p>`,
        answer: p => pow(1 + p.r, -p.s),
        errors: [
          { v: p => 1 - p.s * p.r, msg: p => M`That's the linear approximation (\(\sigma\times\) the percent difference). It is only accurate for small price gaps. Use the exact form: \(q_i/q_j = (p_i/p_j)^{-\sigma} = ${f(1 + p.r)}^{-${p.s}}\).` },
          { v: p => -p.s * ln(1 + p.r), msg: p => M`That's \(\ln(q_i/q_j)\). Exponentiate to get the ratio itself.` },
          { v: p => pow(1 + p.r, p.s), msg: p => M`Check the sign of the exponent. The more expensive variety sells <i>less</i>, so the ratio should be below 1.` },
          { v: p => pow(1 + p.r, -1 / p.s), msg: p => M`The exponent is \(-\sigma\), not \(-1/\sigma\).` }
        ],
        hint: p => M`Exponentiate both sides: \(q_i/q_j = (p_i/p_j)^{-\sigma}\), with \(p_i/p_j = ${f(1 + p.r)}\).`,
        steps: p => [
          { prompt: M`What is \(\ln(p_i/p_j)\)?`, answer: () => ln(1 + p.r), errors: [{ v: () => p.r, msg: p => M`Take the log of the price <i>ratio</i>, \(\ln(${f(1 + p.r)})\).` }], hint: p => M`\(p_i/p_j = ${f(1 + p.r)}\)` },
          { prompt: M`Multiply by \(-\sigma\) to get \(\ln(q_i/q_j)\).`, answer: () => -p.s * ln(1 + p.r), hint: p => M`\(-${p.s}\times ${f(ln(1 + p.r))}\)` },
          { prompt: M`Exponentiate to get \(q_i/q_j\).`, answer: () => pow(1 + p.r, -p.s), hint: p => M`\(e^{${f(-p.s * ln(1 + p.r))}}\)` }
        ],
        solution: p => M`<p>\(q_i/q_j = (${f(1 + p.r)})^{-${p.s}} = ${f(pow(1 + p.r, -p.s))}\). A ${f(p.r * 100)}% higher price means ${f((1 - pow(1 + p.r, -p.s)) * 100, 3)}% fewer units sold relative to the cheaper variety.</p>`
      },
      {
        id: 'ls3', type: 'num',
        gen: () => ({ m: pick([4, 8, 16, 32]) }),
        prompt: p => M`<p>Lecture 28: unit costs follow a learning curve \(c = c_0\,X^{b}\), where \(X\) is cumulative output and \(b = \log_2 0.8 \approx -0.322\), so each doubling of \(X\) cuts cost by 20%.</p><p>If cumulative output grows ${p.m}-fold, what fraction of its original level is unit cost?</p>`,
        answer: p => pow(0.8, Math.log2(p.m)),
        errors: [
          { v: p => 1 - 0.2 * Math.log2(p.m), msg: p => M`Each 20% cut comes off an already lower cost, so the cuts multiply rather than add: \(0.8\times0.8\times\cdots\).` },
          { v: p => 1 / p.m, msg: p => M`That would be an elasticity of \(-1\). Here the elasticity is \(b \approx -0.322\): \(c_1/c_0 = ${p.m}^{-0.322}\).` },
          { v: p => pow(p.m, 0.322), msg: p => M`Cost falls with experience, so the exponent is negative.` },
          { v: p => pow(0.8, p.m), msg: p => M`${p.m}-fold is \(\log_2 ${p.m} = ${Math.log2(p.m)}\) doublings, not ${p.m}.` },
          { v: p => 1 - pow(0.8, Math.log2(p.m)), msg: p => M`That's the share by which cost <i>fell</i>. The question asks for the fraction that remains.` }
        ],
        hint: p => M`How many doublings take you to ${p.m} times the output? Apply the factor 0.8 once per doubling.`,
        steps: p => [
          { prompt: M`How many doublings is a ${p.m}-fold increase? (That is, \(\log_2 ${p.m}\).)`, answer: () => Math.log2(p.m), hint: p => M`\(2^{?} = ${p.m}\)` },
          { prompt: M`Multiply cost by 0.8 once per doubling. What fraction remains?`, answer: () => pow(0.8, Math.log2(p.m)), hint: p => M`\(0.8^{${Math.log2(p.m)}}\)` }
        ],
        solution: p => M`<p>\(c_1/c_0 = ${p.m}^{b} = (2^{${Math.log2(p.m)}})^{\log_2 0.8} = 0.8^{${Math.log2(p.m)}} = ${f(pow(0.8, Math.log2(p.m)))}\). On a log-log graph this is a straight line with slope \(-0.322\).</p>`
      },
      {
        id: 'ls4', type: 'mc',
        prompt: p => M`<p>An estimated equation is \(\ln y = 3 + 0.5\ln x\). If \(x\) rises by 10%, \(y\) rises by about:</p>`,
        options: () => [
          { t: '5%', ok: true, why: M`In a log-log equation the slope is an elasticity: \(0.5\times10\% = 5\%\). (Exactly, \(1.1^{0.5} - 1 = 4.9\%\).)` },
          { t: '0.5%', why: M`That reads 0.5 as a change in \(y\) per unit of \(x\). Both sides are in logs, so the slope means percent per percent.` },
          { t: '50%', why: M`The slope is 0.5, so \(y\) moves half as much as \(x\) in percent terms: about 5%.` },
          { t: '3.5%', why: M`The intercept, 3, sets the level of \(y\). It doesn't affect how \(y\) responds to changes in \(x\).` }
        ]
      }
    ]
  };

  const logsScales = {
    id: 'log-scales', title: 'Log scales on charts', lectures: [1, 20, 23, 28],
    summary: 'On a log axis, equal distances mean equal percent changes and steady growth looks like a straight line.',
    concept: M`
<p>On a log-scale axis, equal vertical distances mean equal <b>ratios</b>: going from 1,000 to 2,000 covers the same distance as going from 10,000 to 20,000. So:</p>
<ul>
<li>Constant growth (\(Y = Y_0(1+g)^t\)) plots as a <b>straight line</b>, because \(\ln Y = \ln Y_0 + t\ln(1+g)\) is linear in \(t\).</li>
<li>The <b>slope</b> on a natural-log axis is the growth rate: \(\ln(1+g) \approx g\) per year.</li>
<li>Two <b>parallel</b> lines grow at the same rate: their ratio stays constant even as the dollar gap widens.</li>
</ul>
<div class="chart-wrap" id="logchart"><div class="toggle" role="group" aria-label="Axis scale"><button type="button" data-scale="lin" aria-pressed="true">Linear axis</button><button type="button" data-scale="log" aria-pressed="false">Log axis</button></div><svg viewBox="0 0 560 260" role="img" aria-label="Two income paths growing at 2% and 4% a year"></svg><div class="unit">Two economies starting at $1,000. Blue grows 4% a year and grey grows 2%. On the linear axis growth looks explosive and the gap balloons. On the log axis both are straight lines, and the steeper one has the faster growth rate.</div></div>
<div class="example"><div class="tag">From Lecture 20 · Creative destruction</div>
<p>Each rung of the quality ladder multiplies quality by \(\lambda = 1.25\). On a log axis the rungs are equally spaced: \(\ln 1.25 = 0.223\) per step. Five steps give \(1.25^{5} = 3.05\) times the original quality.</p></div>`,
    afterRender: (root) => {
      const wrap = root.querySelector('#logchart'); if (!wrap) return;
      const svg = wrap.querySelector('svg');
      const draw = (scale) => {
        const W = 560, H = 260, L = 56, R = 16, T = 16, B = 34, T1 = 60;
        const s1 = t => 1000 * pow(1.04, t), s2 = t => 1000 * pow(1.02, t);
        const ymax = s1(T1), ymin = 1000;
        const X = t => L + (W - L - R) * t / T1;
        const Y = scale === 'log' ? v => T + (H - T - B) * (1 - (ln(v) - ln(ymin)) / (ln(ymax) - ln(ymin))) : v => T + (H - T - B) * (1 - (v - 0) / (ymax));
        const path = fn => { let d = ''; for (let t = 0; t <= T1; t++) d += (t ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(fn(t)).toFixed(1); return d; };
        const ticks = scale === 'log' ? [1000, 2000, 4000, 8000] : [0, 2500, 5000, 7500, 10000];
        let g = '';
        for (const v of ticks) { if (v < (scale === 'log' ? ymin : 0) || v > ymax) continue; const y = Y(scale === 'log' ? v : v); g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--rule)" stroke-width="1"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${v.toLocaleString('en-US')}</text>`; }
        for (const t of [0, 20, 40, 60]) g += `<text x="${X(t)}" y="${H - 12}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono, monospace">yr ${t}</text>`;
        g += `<path d="${path(s2)}" fill="none" stroke="var(--muted)" stroke-width="2"/><path d="${path(s1)}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
        g += `<text x="${X(T1) - 4}" y="${Y(s1(T1)) + 14}" text-anchor="end" font-size="12" fill="var(--accent)">4% a year</text><text x="${X(T1) - 4}" y="${Y(s2(T1)) - 6}" text-anchor="end" font-size="12" fill="var(--muted)">2% a year</text>`;
        svg.innerHTML = g;
        wrap.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.scale === scale ? 'true' : 'false'));
      };
      wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => draw(b.dataset.scale)));
      draw('lin');
    },
    problems: [
      {
        id: 'lv1', type: 'num',
        gen: () => pick([{ a: 1000, b: 2000, c: 10000 }, { a: 500, b: 1500, c: 4000 }, { a: 2000, b: 2500, c: 40000 }, { a: 100, b: 400, c: 3000 }]),
        prompt: p => M`<p>On a log-scale axis, the distance from ${f(p.a)} to ${f(p.b)} equals the distance from ${f(p.c)} to what?</p>`,
        answer: p => p.c * p.b / p.a,
        errors: [{ v: p => p.c + (p.b - p.a), msg: p => M`On a log axis, equal distances mean equal <i>ratios</i>, not equal differences. ${f(p.b)} is \(${f(p.b / p.a)}\times\) ${f(p.a)}, so go \(${f(p.b / p.a)}\times\) from ${f(p.c)}.` }],
        hint: p => M`What is \(${f(p.b)}/${f(p.a)}\)? Apply the same ratio to ${f(p.c)}.`,
        solution: p => M`<p>Equal log distances mean equal ratios: \(${f(p.b)}/${f(p.a)} = ${f(p.b / p.a)}\), so the answer is \(${fc(p.c)}\times ${f(p.b / p.a)} = ${fc(p.c * p.b / p.a)}\).</p>`
      },
      {
        id: 'lv2', type: 'mc',
        prompt: p => M`<p>Two countries' incomes per person are plotted on a log scale over 50 years. The two lines are parallel. What does that tell you?</p>`,
        options: () => [
          { t: 'They grew at the same rate, so the ratio of their incomes stayed constant.', ok: true, why: M`Parallel lines on a log axis have the same slope, meaning the same growth rate. The ratio \(y_1/y_2\) is fixed, even though the dollar gap keeps widening.` },
          { t: 'The dollar gap between them stayed constant.', why: 'That is what parallel lines mean on a linear axis. On a log axis, a constant vertical distance is a constant ratio, so the dollar gap grows as both get richer.' },
          { t: 'The poorer country was catching up.', why: 'Catching up means the poorer country grows faster, so its line would be steeper and the lines would converge.' },
          { t: 'Both countries grew by the same number of dollars each year.', why: 'Equal dollar increments would make the richer country’s growth rate lower, so its line would be flatter on a log axis.' }
        ]
      },
      {
        id: 'lv3', type: 'num', unit: 'pct', tol: { abs: 0.03, rel: 0.005 },
        gen: () => ({ y0: pick([7.5, 8, 8.6]), d: pick([0.7, 1.05, 1.4]), n: pick([35, 50, 70]) }),
        prompt: p => M`<p>On a natural-log chart, \(\ln(\text{income per person})\) rises from ${p.y0} to ${f(p.y0 + p.d)} over ${p.n} years in a straight line. What is the annual growth rate? (Using the log slope is fine.)</p>`,
        answer: p => p.d / p.n * 100,
        alts: [{ v: p => (exp(p.d / p.n) - 1) * 100, msg: p => M`That's the exact compounded rate, \(e^{${f(p.d / p.n)}} - 1\). The log slope, \(${f(p.d / p.n * 100)}\%\), is the same thing in log points.` }],
        errors: [
          { v: p => p.d * 100, msg: p => M`That's the total change over all ${p.n} years. Divide by ${p.n} to get the slope per year.` },
          { v: p => (exp(p.d) - 1) * 100, msg: p => M`That's total growth over the whole period. You need the per-year slope: \(${f(p.d)}/${p.n}\).` },
          { v: p => ((p.y0 + p.d) / p.y0 - 1) / p.n * 100, msg: p => M`A ratio of two logs doesn't mean anything here. On a log chart the growth rate is the <i>difference</i> in logs per year.` }
        ],
        hint: p => M`Slope \(=\) change in \(\ln y\) divided by change in years.`,
        solution: p => M`<p>Slope \(= ${f(p.d)}/${p.n} = ${f(p.d / p.n)}\) per year, about \(${f(p.d / p.n * 100, 3)}\%\) growth (exactly \(${f((exp(p.d / p.n) - 1) * 100, 3)}\%\) compounded).</p>`
      },
      {
        id: 'lv4', type: 'mc',
        prompt: p => M`<p>In Lecture 20 each rung of the quality ladder multiplies quality by \(\lambda = 1.25\). Plotted on a log axis, the rungs are:</p>`,
        options: () => [
          { t: M`Equally spaced, \(\ln 1.25 = 0.223\) apart`, ok: true, why: M`Each step multiplies by the same factor, and on a log axis equal factors are equal distances.` },
          { t: 'Farther and farther apart', why: 'That’s how they look on a linear axis, where each step adds 25% of an ever-larger number.' },
          { t: 'Closer and closer together', why: M`That would mean the steps shrink in percentage terms. Here every step is the same 25%.` },
          { t: 'You can’t tell without knowing the starting quality', why: M`On a log axis the spacing depends only on the ratio between rungs, which is always 1.25.` }
        ]
      }
    ]
  };

  /* ===================================================================== */
  /* MODULE 8: COBB-DOUGLAS AND CES                                          */
  /* ===================================================================== */

  const cdBasics = {
    id: 'cd-basics', title: 'Cobb-Douglas basics', lectures: [2, 3, 4, 6, 10, 11],
    summary: 'Evaluate Y = A K^α L^(1−α), see constant returns, and convert to per-worker form.',
    concept: M`
<p>The Cobb-Douglas production function is the workhorse of the first half of the course:</p>
<div class="rulebox">\[Y = A\,K^{\alpha}L^{1-\alpha}, \qquad 0<\alpha<1\]</div>
<ul>
<li><b>Constant returns to scale.</b> The exponents add to 1, so multiplying both \(K\) and \(L\) by \(m\) multiplies \(Y\) by \(m^{\alpha}m^{1-\alpha} = m\).</li>
<li><b>Diminishing returns to each input alone.</b> Doubling \(K\) alone multiplies \(Y\) by only \(2^{\alpha}\) (\(1.26\) when \(\alpha = 1/3\)). That curvature is why the Solow investment curve bends over while the depreciation line stays straight.</li>
<li><b>Per-worker form.</b> Divide both sides by \(L\) and use \(L^{1-\alpha}/L = L^{-\alpha}\):
\[y \equiv \frac{Y}{L} = A\,\frac{K^{\alpha}L^{1-\alpha}}{L} = A\,K^{\alpha}L^{-\alpha} = A\left(\frac{K}{L}\right)^{\alpha} = A\,k^{\alpha}\]</li>
</ul>
<p>Reminder on fractional exponents: \(x^{1/3} = \sqrt[3]{x}\) and \(x^{2/3} = (\sqrt[3]{x})^2\). So \(64^{1/3} = 4\) and \(27^{2/3} = 9\).</p>
<div class="example"><div class="tag">From Lecture 3 · Quantifying the Solow model</div>
<p>With \(\alpha = 1/3\), a country with 8 times as much capital per worker has only \(8^{1/3} = 2\) times the output per worker. Capital alone can't explain hundredfold income gaps.</p></div>`,
    problems: [
      {
        id: 'cb1', type: 'num',
        gen: () => ({ A: pick([1, 2, 3]), K: pick([8, 27, 64, 125, 216, 1000]), L: pick([8, 27, 64, 125, 1000]) }),
        prompt: p => M`<p>Let \(Y = A K^{1/3} L^{2/3}\) with \(A = ${p.A}\), \(K = ${p.K}\) and \(L = ${p.L}\). What is \(Y\)?</p>`,
        answer: p => p.A * cbrt(p.K) * pow(cbrt(p.L), 2),
        errors: [
          { v: p => p.A * pow(cbrt(p.K), 2) * cbrt(p.L), msg: p => M`You swapped the exponents: capital gets \(1/3\) and labor gets \(2/3\).` },
          { v: p => p.A * (cbrt(p.K) + pow(cbrt(p.L), 2)), msg: p => M`Cobb-Douglas <i>multiplies</i> the inputs: \(A\times K^{1/3}\times L^{2/3}\).` },
          { v: p => cbrt(p.K) * pow(cbrt(p.L), 2), msg: p => M`Don't forget to multiply by \(A = ${p.A}\).` },
          { v: p => p.A * cbrt(p.K) * cbrt(p.L), msg: p => M`\(L^{2/3}\) is the cube root <i>squared</i>: \((L^{1/3})^2\).` },
          { v: p => p.A * p.K / 3 * p.L * 2 / 3, msg: p => M`Exponents aren't multipliers: \(K^{1/3}\) means the cube root of \(K\), not \(K/3\).` }
        ],
        hint: p => M`Compute \(K^{1/3}\) (a cube root), then \(L^{2/3} = (L^{1/3})^2\), then multiply everything by \(A\).`,
        steps: p => [
          { prompt: M`What is \(K^{1/3} = \sqrt[3]{${p.K}}\)?`, answer: () => cbrt(p.K), errors: [{ v: () => p.K / 3, msg: p => 'The exponent 1/3 means the cube root, not division by 3.' }], hint: p => M`What number cubed is ${p.K}?` },
          { prompt: M`What is \(L^{2/3} = (\sqrt[3]{${p.L}})^2\)?`, answer: () => pow(cbrt(p.L), 2), errors: [{ v: () => cbrt(p.L), msg: p => 'Now square the cube root.' }], hint: p => M`\(\sqrt[3]{${p.L}} = ${cbrt(p.L)}\); square it.` },
          { prompt: M`Multiply: \(A\times K^{1/3}\times L^{2/3}\).`, answer: () => p.A * cbrt(p.K) * pow(cbrt(p.L), 2), hint: p => M`\(${p.A}\times${cbrt(p.K)}\times${pow(cbrt(p.L), 2)}\)` }
        ],
        solution: p => M`<p>\(Y = ${p.A}\times ${p.K}^{1/3}\times ${p.L}^{2/3} = ${p.A}\times ${cbrt(p.K)}\times ${pow(cbrt(p.L), 2)} = ${f(p.A * cbrt(p.K) * pow(cbrt(p.L), 2))}\)</p>`
      },
      {
        id: 'cb2', type: 'num',
        gen: () => ({ m: pick([2, 8, 10]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.4, t: '0.4' }, { v: 0.25, t: '0.25' }]) }),
        prompt: p => M`<p>\(Y = A K^{\alpha}L^{1-\alpha}\) with \(\alpha = ${atex(p.al)}\). Capital is multiplied by ${p.m} while labor stays fixed. By what factor does output rise?</p>`,
        answer: p => pow(p.m, p.al.v),
        errors: [
          { v: p => p.m, msg: p => M`Output rises ${p.m}-fold only if <i>both</i> inputs rise ${p.m}-fold (constant returns). With labor fixed, diminishing returns kick in: the factor is \(${p.m}^{\alpha}\).` },
          { v: p => p.m * p.al.v, msg: p => M`\(\alpha\) is an exponent, not a multiplier: the factor is \(m^{\alpha}\).` },
          { v: p => 1 + p.al.v * (p.m - 1), msg: p => M`That's a linear approximation. With Cobb-Douglas the exact factor is \(m^{\alpha}\), and for big changes the two differ.` },
          { v: p => pow(p.m, 1 - p.al.v), msg: p => M`\(1-\alpha\) is labor's exponent. Capital's is \(\alpha\).` }
        ],
        hint: p => M`Replace \(K\) with \(mK\): \(A(mK)^{\alpha}L^{1-\alpha} = m^{\alpha}\cdot A K^{\alpha}L^{1-\alpha}\).`,
        solution: p => M`<p>\(Y_{new}/Y_{old} = (mK)^{\alpha}/K^{\alpha} = m^{\alpha} = ${p.m}^{${atex(p.al)}} = ${f(pow(p.m, p.al.v))}\).</p>`
      },
      {
        id: 'cb3', type: 'num',
        gen: () => { const L = pick([50, 100, 200]); const k = pick([8, 27, 64]); return { L, k, K: L * k, A: pick([1, 2]) }; },
        prompt: p => M`<p>An economy has \(K = ${fc(p.K)}\), \(L = ${p.L}\), \(A = ${p.A}\) and \(Y = AK^{1/3}L^{2/3}\). What is output <i>per worker</i>, \(y = Y/L\)?</p>`,
        answer: p => p.A * cbrt(p.k),
        errors: [
          { v: p => p.A * cbrt(p.K) * pow(p.L, 2 / 3), msg: p => M`That's total output \(Y\). Divide by \(L\), or use the shortcut \(y = A k^{1/3}\) with \(k = K/L\).` },
          { v: p => p.A * cbrt(p.K) / p.L, msg: p => M`Divide the <i>whole</i> expression by \(L\): \(L^{2/3}/L = L^{-1/3}\), so \(y = A(K/L)^{1/3}\).` },
          { v: p => p.A * p.k, msg: p => M`Capital per worker is \(k = ${'K/L'}\), but output per worker is \(A k^{1/3}\). Don't forget the exponent.` }
        ],
        hint: p => M`Use \(y = A k^{\alpha}\) with \(k = K/L\).`,
        steps: p => [
          { prompt: M`What is capital per worker, \(k = K/L\)?`, answer: () => p.k, hint: p => M`\(${fc(p.K)}/${p.L}\)` },
          { prompt: M`What is \(k^{1/3}\)?`, answer: () => cbrt(p.k), hint: p => M`What number cubed is ${p.k}?` },
          { prompt: M`Multiply by \(A\).`, answer: () => p.A * cbrt(p.k), hint: p => M`\(${p.A}\times ${cbrt(p.k)}\)` }
        ],
        solution: p => M`<p>\(k = ${fc(p.K)}/${p.L} = ${p.k}\), so \(y = A k^{1/3} = ${p.A}\times ${cbrt(p.k)} = ${p.A * cbrt(p.k)}\).</p>`
      },
      {
        id: 'cb4', type: 'mc',
        prompt: p => M`<p>In the Solow diagram, investment \(\gamma A k^{\alpha}\) is a curve that bends over, while depreciation \((n+\delta)k\) is a straight line. Why does the investment curve bend?</p>`,
        options: () => [
          { t: M`Because \(\alpha < 1\): each extra unit of capital per worker adds less output than the one before.`, ok: true, why: M`\(k^{\alpha}\) with \(\alpha<1\) is concave (diminishing returns). Investment is a fixed share of output, so it inherits the curvature. Eventually the straight depreciation line catches up, and that crossing is the steady state.` },
          { t: 'Because the saving rate falls as people get richer.', why: M`In the Solow model the saving rate \(\gamma\) is a constant. The curvature comes from the production function.` },
          { t: 'Because depreciation rises faster than capital.', why: M`Depreciation is proportional to \(k\), which is why it's a straight line. The bending is on the investment side.` },
          { t: M`Because \(A\) falls as capital accumulates.`, why: M`\(A\) is held fixed along the curve. The shape comes from the exponent \(\alpha\).` }
        ]
      }
    ]
  };

  const cdMP = {
    id: 'cd-marginal-products', title: 'Marginal products and factor shares', lectures: [3, 4, 10, 13],
    summary: 'Differentiate Cobb-Douglas with the power rule and see why the exponents equal income shares.',
    concept: M`
<p>The <b>power rule</b>: \(\frac{d}{dx}x^{a} = a\,x^{a-1}\). The exponent comes down in front and drops by one.</p>
<p>A <b>partial derivative</b> changes one input while holding the others fixed, so they act as constants. For \(Y = AK^{\alpha}L^{1-\alpha}\):</p>
<div class="rulebox">\[MPK = \frac{\partial Y}{\partial K} = \alpha A K^{\alpha-1}L^{1-\alpha} = \alpha\frac{Y}{K}, \qquad MPL = \frac{\partial Y}{\partial L} = (1-\alpha)AK^{\alpha}L^{-\alpha} = (1-\alpha)\frac{Y}{L}\]</div>
<p>The second form of each comes from noticing that \(K^{\alpha-1} = K^{\alpha}/K\). So <b>marginal product = exponent \(\times\) average product.</b></p>
<p><b>Factor shares.</b> Competitive firms pay each input its marginal product: \(r = MPK\) and \(w = MPL\). Then capital's share of income is</p>
<div class="rulebox">\[\frac{rK}{Y} = \frac{\alpha (Y/K)\,K}{Y} = \alpha\]</div>
<p>and labor's is \(1-\alpha\). That is why we set \(\alpha \approx 1/3\): capital gets about a third of national income in the data.</p>
<div class="example"><div class="tag">From Lecture 10 · Quantifying human capital</div>
<p>With \(Y = AK^{\alpha}(hL)^{1-\alpha}\), the wage is \(\partial Y/\partial L = (1-\alpha)Y/L\). Plugging in \(h = e^{S}\) gives the log-linear Mincer equation that we estimate.</p></div>`,
    problems: [
      {
        id: 'cm1', type: 'expr', label: 'Algebra',
        prompt: p => M`<p>Find the marginal product of capital, \(\partial Y/\partial K\), for \(Y = A K^{\alpha}L^{1-\alpha}\).</p><p>Type it using <code>A</code>, <code>K</code>, <code>L</code> and <code>alpha</code>, for example <code>A*K^(alpha)</code>.</p>`,
        vars: { A: [0.5, 3], K: [0.5, 5], L: [0.5, 5], alpha: [0.15, 0.85] },
        answer: 'alpha*A*K^(alpha-1)*L^(1-alpha)',
        errors: [
          { e: 'A*K^(alpha-1)*L^(1-alpha)', msg: M`Almost. The power rule brings the exponent down in front: \(\frac{d}{dK}K^{\alpha} = \alpha K^{\alpha-1}\). You're missing the \(\alpha\).` },
          { e: 'alpha*A*K^alpha*L^(1-alpha)', msg: M`You brought \(\alpha\) down but didn't reduce the exponent by one. It should be \(K^{\alpha-1}\).` },
          { e: 'alpha*A*K^(alpha-1)', msg: M`\(L\) is held constant, but it doesn't disappear: \(L^{1-\alpha}\) stays as a multiplier.` },
          { e: 'alpha*A*K^(alpha-1)*(1-alpha)*L^(-alpha)', msg: M`You also differentiated with respect to \(L\). In a partial derivative with respect to \(K\), \(L^{1-\alpha}\) is just a constant.` },
          { e: '(1-alpha)*A*K^alpha*L^(-alpha)', msg: M`That's the marginal product of <i>labor</i>. Differentiate with respect to \(K\).` }
        ],
        hint: p => M`Treat \(A\) and \(L^{1-\alpha}\) as constants. Apply the power rule to \(K^{\alpha}\) only.`,
        solution: p => M`<p>\(\frac{\partial Y}{\partial K} = A L^{1-\alpha}\cdot\alpha K^{\alpha-1} = \alpha A K^{\alpha-1}L^{1-\alpha}\), which equals \(\alpha Y/K\). Type: <code>alpha*A*K^(alpha-1)*L^(1-alpha)</code>.</p>`
      },
      {
        id: 'cm2', type: 'expr', label: 'Algebra',
        prompt: p => M`<p>Now the marginal product of labor, \(\partial Y/\partial L\), for \(Y = A K^{\alpha}L^{1-\alpha}\).</p>`,
        vars: { A: [0.5, 3], K: [0.5, 5], L: [0.5, 5], alpha: [0.15, 0.85] },
        answer: '(1-alpha)*A*K^alpha*L^(-alpha)',
        errors: [
          { e: '(1-alpha)*A*K^alpha*L^(1-alpha)', msg: M`Bring \(1-\alpha\) down <i>and</i> reduce the exponent by one: \((1-\alpha) - 1 = -\alpha\).` },
          { e: 'A*K^alpha*L^(-alpha)', msg: M`The exponent \(1-\alpha\) comes down in front as a multiplier.` },
          { e: '(1-alpha)*A*L^(-alpha)', msg: M`\(K^{\alpha}\) is held constant, but it stays in the expression as a multiplier.` },
          { e: 'alpha*A*K^(alpha-1)*L^(1-alpha)', msg: M`That's the marginal product of capital. Differentiate with respect to \(L\).` },
          { e: '-alpha*A*K^alpha*L^(-alpha-1)', msg: M`Differentiate once: \(\frac{d}{dL}L^{1-\alpha} = (1-\alpha)L^{-\alpha}\).` }
        ],
        hint: p => M`The exponent on \(L\) is \(1-\alpha\). Bring it down and subtract 1 from it.`,
        solution: p => M`<p>\(\frac{\partial Y}{\partial L} = AK^{\alpha}\cdot(1-\alpha)L^{-\alpha} = (1-\alpha)A\left(\frac{K}{L}\right)^{\alpha} = (1-\alpha)\frac{Y}{L}\). Any of these forms is accepted.</p>`
      },
      {
        id: 'cm3', type: 'num',
        gen: () => ({ Y: pick([300, 600, 1200]), K: pick([900, 1800, 3000]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.3, t: '0.3' }, { v: 0.4, t: '0.4' }]) }),
        prompt: p => M`<p>An economy has \(Y = ${fc(p.Y)}\) and \(K = ${fc(p.K)}\) with Cobb-Douglas production and \(\alpha = ${atex(p.al)}\). What is the marginal product of capital?</p>`,
        answer: p => p.al.v * p.Y / p.K,
        errors: [
          { v: p => p.Y / p.K, msg: p => M`That's the <i>average</i> product of capital, \(Y/K\). With Cobb-Douglas the marginal product is \(\alpha\) times the average: \(MPK = \alpha Y/K\).` },
          { v: p => p.al.v * p.K / p.Y, msg: p => M`Flip the ratio: \(MPK = \alpha\,Y/K\).` },
          { v: p => (1 - p.al.v) * p.Y / p.K, msg: p => M`Capital's exponent is \(\alpha\), not \(1-\alpha\).` }
        ],
        hint: p => M`\(MPK = \alpha A K^{\alpha-1}L^{1-\alpha} = \alpha\cdot\frac{AK^{\alpha}L^{1-\alpha}}{K} = \alpha\frac{Y}{K}\).`,
        solution: p => M`<p>\(MPK = \alpha Y/K = ${atex(p.al)}\times ${fc(p.Y)}/${fc(p.K)} = ${f(p.al.v * p.Y / p.K)}\). In a competitive market this is the rental rate \(r\).</p>`
      },
      {
        id: 'cm4', type: 'num', unitNote: 'Answer in trillions of dollars.',
        gen: () => ({ G: pick([20, 25, 30]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.3, t: '0.3' }, { v: 0.4, t: '0.4' }]) }),
        prompt: p => M`<p>GDP is $${p.G} trillion, production is Cobb-Douglas with \(\alpha = ${atex(p.al)}\), and workers are paid their marginal product. What is total labor income, in trillions?</p>`,
        answer: p => (1 - p.al.v) * p.G,
        errors: [
          { v: p => p.al.v * p.G, msg: p => M`That's capital's income. Labor's share is \(1-\alpha\).` },
          { v: p => p.G, msg: p => M`Labor doesn't get all of GDP. With \(w = MPL\), total labor income is \(wL = (1-\alpha)Y\).` }
        ],
        hint: p => M`\(wL = MPL\times L = (1-\alpha)\frac{Y}{L}\times L\).`,
        solution: p => M`<p>\(wL = (1-\alpha)Y = ${f(1 - p.al.v)}\times ${p.G} = ${f((1 - p.al.v) * p.G)}\) trillion dollars; capital gets the remaining $${f(p.al.v * p.G)} trillion.</p>`
      }
    ]
  };

  const cdElast = {
    id: 'cd-elasticities', title: 'Exponents as elasticities; growth accounting', lectures: [3, 11, 14],
    summary: 'In logs, Cobb-Douglas exponents are elasticities, which turns growth and development accounting into arithmetic.',
    concept: M`
<p>Take logs of \(Y = AK^{\alpha}L^{1-\alpha}\): \(\ln Y = \ln A + \alpha\ln K + (1-\alpha)\ln L\). The slope of \(\ln Y\) with respect to \(\ln K\) is \(\alpha\), so</p>
<div class="rulebox">\[\frac{\partial\ln Y}{\partial \ln K} = \alpha: \quad \text{a 10\% rise in } K \text{ raises } Y \text{ by about } \alpha\times 10\%\]</div>
<p><b>Growth accounting.</b> Take the change over time of both sides. Writing \(\hat{x}\) for the growth rate of \(x\):</p>
<div class="rulebox">\[\hat{Y} = \hat{A} + \alpha\hat{K} + (1-\alpha)\hat{L} \quad\Longrightarrow\quad \hat{A} = \hat{Y} - \alpha\hat{K} - (1-\alpha)\hat{L}\]</div>
<p>TFP growth \(\hat{A}\) is the <b>residual</b>: output growth left over after crediting inputs.</p>
<p><b>Development accounting</b> does the same thing across countries using ratios: \(\frac{A_2}{A_1} = \frac{y_2/y_1}{(k_2/k_1)^{\alpha}(h_2/h_1)^{1-\alpha}}\).</p>
<div class="example"><div class="tag">From Lecture 11 · Measuring productivity</div>
<p>With \(\ln Y = \ln A + 0.33\ln K + 0.45\ln h + 0.22\ln L\), a 10% increase in human capital raises output by about 4.5%. A 10% drop in the workforce lowers GDP by about 2.2%.</p></div>`,
    problems: [
      {
        id: 'ce1', type: 'num', unit: 'pct', tol: { abs: 0.01, rel: 0.004 },
        gen: () => ({ inp: pick([{ n: 'human capital \\(h\\)', c: 0.45 }, { n: 'physical capital \\(K\\)', c: 0.33 }, { n: 'the number of workers \\(L\\)', c: 0.22 }]), q: pick([5, 10, 20]) }),
        prompt: p => M`<p>Lecture 11 writes \(\ln Y = \ln A + 0.33\ln K + 0.45\ln h + 0.22\ln L\).</p><p>If ${p.inp.n} rises by ${p.q}% and nothing else changes, by about what percent does output rise?</p>`,
        answer: p => p.inp.c * p.q,
        errors: [
          { v: p => p.q, msg: p => M`Output would rise one-for-one only if <i>every</i> input rose. Each coefficient is an elasticity, so multiply the percent change by that input's coefficient.` },
          { v: p => 0.33 * p.q, msg: p => M`Use the coefficient on the input that changed.` },
          { v: p => 0.45 * p.q, msg: p => M`Use the coefficient on the input that changed.` },
          { v: p => 0.22 * p.q, msg: p => M`Use the coefficient on the input that changed.` }
        ],
        hint: p => M`In a log-linear equation, %\(\Delta Y \approx\) coefficient \(\times\) %\(\Delta\)input.`,
        solution: p => M`<p>\(\%\Delta Y \approx ${p.inp.c}\times ${p.q}\% = ${f(p.inp.c * p.q)}\%\).</p>`
      },
      {
        id: 'ce2', type: 'num', unit: 'pct', tol: { abs: 0.02 },
        gen: () => ({ Y: pick([6, 7, 8, 9]), K: pick([8, 10, 12]), L: pick([2, 3, 4, 5]), al: pick([0.3, 0.4]) }),
        prompt: p => M`<p>Growth accounting. Output grows ${p.Y}% a year, capital ${p.K}% a year and labor ${p.L}% a year, with \(\alpha = ${p.al}\). What is TFP growth, \(\hat{A}\)?</p>`,
        answer: p => p.Y - p.al * p.K - (1 - p.al) * p.L,
        errors: [
          { v: p => p.Y - p.K - p.L, msg: p => M`Inputs get credit in proportion to their shares: weight capital growth by \(\alpha\) and labor growth by \(1-\alpha\).` },
          { v: p => p.Y - p.al * p.K, msg: p => M`You credited capital but not labor. Subtract \((1-\alpha)\hat{L}\) too.` },
          { v: p => p.Y - (1 - p.al) * p.K - p.al * p.L, msg: p => M`The weights are swapped: capital gets \(\alpha\) and labor gets \(1-\alpha\).` },
          { v: p => p.Y + p.al * p.K + (1 - p.al) * p.L, msg: p => M`TFP is what's <i>left over</i> after subtracting the inputs' contributions.` },
          { v: p => p.Y - p.al * p.L - (1 - p.al) * p.K, msg: p => M`The weights are swapped: capital gets \(\alpha\) and labor gets \(1-\alpha\).` }
        ],
        hint: p => M`\(\hat{A} = \hat{Y} - \alpha\hat{K} - (1-\alpha)\hat{L}\).`,
        steps: p => [
          { prompt: M`Capital's contribution: \(\alpha\hat{K}\) (in percent)?`, unit: 'pct', tol: { abs: 0.01 }, answer: () => p.al * p.K, hint: p => M`\(${p.al}\times ${p.K}\)` },
          { prompt: M`Labor's contribution: \((1-\alpha)\hat{L}\)?`, unit: 'pct', tol: { abs: 0.01 }, answer: () => (1 - p.al) * p.L, hint: p => M`\(${f(1 - p.al)}\times ${p.L}\)` },
          { prompt: M`Subtract both from \(\hat{Y}\).`, unit: 'pct', tol: { abs: 0.02 }, answer: () => p.Y - p.al * p.K - (1 - p.al) * p.L, hint: p => M`\(${p.Y} - ${f(p.al * p.K)} - ${f((1 - p.al) * p.L)}\)` }
        ],
        solution: p => { const a = p.Y - p.al * p.K - (1 - p.al) * p.L; return M`<p>\(\hat{A} = ${p.Y} - ${p.al}(${p.K}) - ${f(1 - p.al)}(${p.L}) = ${p.Y} - ${f(p.al * p.K)} - ${f((1 - p.al) * p.L)} = ${f(a)}\%\). ${a < 1 ? 'Most growth here comes from accumulating inputs, which is Alwyn Young’s point about Singapore.' : ''}</p>`; }
      },
      {
        id: 'ce3', type: 'num',
        gen: () => ({ y: pick([0.2, 0.3, 0.5]), k: pick([0.24, 0.4, 0.6]), hh: pick([0.6, 0.77, 0.9]), al: pick([{ v: 0.5, t: '0.5' }, { v: 1 / 3, t: '1/3' }]) }),
        prompt: p => M`<p>Development accounting (Lecture 11). Relative to the U.S., a country has output per worker \(y_2/y_1 = ${p.y}\), capital term \(k_2/k_1 = ${p.k}\) and human capital \(h_2/h_1 = ${p.hh}\). With \(\alpha = ${atex(p.al)}\), what is its productivity relative to the U.S.?</p>\[\frac{A_2}{A_1} = \frac{y_2/y_1}{(k_2/k_1)^{\alpha}(h_2/h_1)^{1-\alpha}}\]`,
        answer: p => p.y / (pow(p.k, p.al.v) * pow(p.hh, 1 - p.al.v)),
        errors: [
          { v: p => p.y / (p.k * p.hh), msg: p => M`The input ratios need their exponents: \((k_2/k_1)^{\alpha}\) and \((h_2/h_1)^{1-\alpha}\).` },
          { v: p => p.y / (p.al.v * p.k + (1 - p.al.v) * p.hh), msg: p => M`Cobb-Douglas combines inputs <i>multiplicatively</i> (a geometric average), not as a weighted sum.` },
          { v: p => p.y * pow(p.k, p.al.v) * pow(p.hh, 1 - p.al.v), msg: p => M`Divide by the inputs' contribution. TFP is what output can't be explained by.` },
          { v: p => p.y / (pow(p.k, 1 - p.al.v) * pow(p.hh, p.al.v)), msg: p => M`The exponents are swapped: \(k\) gets \(\alpha\) and \(h\) gets \(1-\alpha\).` }
        ],
        hint: p => M`Compute the denominator first: raise each ratio to its exponent and multiply.`,
        steps: p => [
          { prompt: M`What is \((k_2/k_1)^{\alpha} = ${p.k}^{${atex(p.al)}}\)?`, answer: () => pow(p.k, p.al.v), errors: [{ v: () => p.al.v * p.k, msg: p => 'Raise to the power α rather than multiplying by it.' }], hint: p => M`Type <code>${p.k}^(${p.al.t})</code> into a calculator.` },
          { prompt: M`What is \((h_2/h_1)^{1-\alpha}\)?`, answer: () => pow(p.hh, 1 - p.al.v), hint: p => M`\(${p.hh}^{${f(1 - p.al.v)}}\)` },
          { prompt: M`Divide \(y_2/y_1 = ${p.y}\) by the product of those two numbers.`, answer: () => p.y / (pow(p.k, p.al.v) * pow(p.hh, 1 - p.al.v)), hint: p => M`\(${p.y}/(${f(pow(p.k, p.al.v))}\times ${f(pow(p.hh, 1 - p.al.v))})\)` }
        ],
        solution: p => M`<p>\(\frac{A_2}{A_1} = \frac{${p.y}}{${p.k}^{${atex(p.al)}}\times ${p.hh}^{${f(1 - p.al.v)}}} = \frac{${p.y}}{${f(pow(p.k, p.al.v))}\times ${f(pow(p.hh, 1 - p.al.v))}} = ${f(p.y / (pow(p.k, p.al.v) * pow(p.hh, 1 - p.al.v)))}\). Inputs explain part of the income gap; this residual is the rest.</p>`
      },
      {
        id: 'ce4', type: 'mc',
        prompt: p => M`<p>In growth accounting, a 10% rise in \(A\) raises output by 10%, holding inputs fixed. But in the Solow steady state with \(\alpha = 1/3\), a 10% rise in \(A\) raises output per worker by about 15%. Why the difference?</p>`,
        options: () => [
          { t: M`Higher \(A\) also raises steady-state capital per worker, which adds to output: \(y_{ss}\propto A^{1/(1-\alpha)} = A^{1.5}\).`, ok: true, why: M`Growth accounting holds \(K\) fixed (the direct effect). In the steady state, more productive economies also accumulate more capital, and that indirect effect adds the extra 5%.` },
          { t: 'Growth accounting uses the wrong value of α.', why: M`The same \(\alpha\) is used in both. The difference is whether capital is allowed to adjust.` },
          { t: 'The 15% is a log approximation and the 10% is exact.', why: M`Both are log changes. The 1.5 comes from solving for the steady state, where \(y_{ss} = A^{1/(1-\alpha)}(\cdot)\).` },
          { t: 'Population growth falls when A rises.', why: M`\(n\) is held fixed in this comparison. The extra effect works through capital accumulation.` }
        ]
      }
    ]
  };

  const cdSteady = {
    id: 'cd-steady-state', title: 'Solving for a steady state', lectures: [3, 4, 11],
    summary: 'Rearrange k^(1−α) = γA/(n+δ) and handle exponents like 1/(1−α) and α/(1−α).',
    concept: M`
<p>In the Solow steady state, investment just covers depreciation and dilution:</p>
<div class="rulebox">\[\gamma A k^{\alpha} = (n+\delta)\,k\]</div>
<p>Solve for \(k\) in three moves:</p>
<ol>
<li>Divide both sides by \(k^{\alpha}\) and by \((n+\delta)\): \(\;k^{1-\alpha} = \dfrac{\gamma A}{n+\delta}\). (Use \(k/k^{\alpha} = k^{1-\alpha}\).)</li>
<li>Raise both sides to the power \(\tfrac{1}{1-\alpha}\), which undoes the exponent \(1-\alpha\): \(\;k_{ss} = \left(\dfrac{\gamma A}{n+\delta}\right)^{1/(1-\alpha)}\).</li>
<li>Plug into \(y = Ak^{\alpha}\) and collect powers of \(A\): \(\;y_{ss} = A^{1/(1-\alpha)}\left(\dfrac{\gamma}{n+\delta}\right)^{\alpha/(1-\alpha)}\).</li>
</ol>
<p>Exponent rules used: \((x^{a})^{b} = x^{ab}\) and \(x^{a}x^{b} = x^{a+b}\). With \(\alpha = 1/3\), the exponents are \(\tfrac{1}{1-\alpha} = 1.5\) and \(\tfrac{\alpha}{1-\alpha} = 0.5\).</p>
<div class="example"><div class="tag">From Lecture 3 · Quantifying the Solow model</div>
<p>Because the exponent on \(\gamma\) is only 0.5, doubling the saving rate raises steady-state income by \(2^{0.5} = 1.41\), or 41%. Saving differences can't explain 30-to-1 income gaps; productivity differences, amplified by the 1.5 exponent, do much more.</p></div>`,
    problems: [
      {
        id: 'cs1', type: 'num',
        gen: () => ({ al: pick([{ v: 0.25, t: '1/4' }, { v: 1 / 3, t: '1/3' }, { v: 0.4, t: '2/5' }, { v: 0.5, t: '1/2' }, { v: 0.6, t: '3/5' }]) }),
        prompt: p => M`<p>With \(\alpha = ${p.al.t}\), what is the exponent on the saving rate in \(y_{ss}\), namely \(\dfrac{\alpha}{1-\alpha}\)?</p>`,
        answer: p => p.al.v / (1 - p.al.v),
        errors: [
          { v: p => 1 / (1 - p.al.v), msg: p => M`That's \(1/(1-\alpha)\), the exponent on \(A\) (and on \(k_{ss}\)). The exponent on \(\gamma\) in \(y_{ss}\) has \(\alpha\) on top.` },
          { v: p => (1 - p.al.v) / p.al.v, msg: p => M`Flip it: \(\alpha\) goes in the numerator.` },
          { v: p => p.al.v, msg: p => M`Divide \(\alpha\) by \(1-\alpha\).` },
          { v: p => p.al.v / (1 + p.al.v), msg: p => M`The denominator is \(1-\alpha\), not \(1+\alpha\).` }
        ],
        hint: p => M`\(1 - ${p.al.t} = ${f(1 - p.al.v)}\); divide \(${p.al.t}\) by that.`,
        solution: p => M`<p>\(\frac{\alpha}{1-\alpha} = \frac{${f(p.al.v)}}{${f(1 - p.al.v)}} = ${f(p.al.v / (1 - p.al.v))}\). (The exponent on \(A\) is \(\frac{1}{1-\alpha} = ${f(1 / (1 - p.al.v))}\).)</p>`
      },
      {
        id: 'cs2', type: 'num',
        gen: () => ({ g: pick([0.15, 0.2, 0.25, 0.3]), nd: pick([0.05, 0.08, 0.1]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.5, t: '1/2' }]) }),
        prompt: p => M`<p>Solve for steady-state capital per worker when \(\gamma = ${p.g}\), \(A = 1\), \(n+\delta = ${p.nd}\) and \(\alpha = ${p.al.t}\).</p>\[\gamma A k^{\alpha} = (n+\delta)k\]`,
        answer: p => pow(p.g / p.nd, 1 / (1 - p.al.v)),
        errors: [
          { v: p => p.g / p.nd, msg: p => M`That's \(k^{1-\alpha}\), not \(k\). Undo the exponent by raising to \(1/(1-\alpha)\).` },
          { v: p => pow(p.g / p.nd, 1 - p.al.v), msg: p => M`To undo the power \(1-\alpha\), raise to its <i>reciprocal</i>, \(1/(1-\alpha)\).` },
          { v: p => pow(p.g / p.nd, p.al.v), msg: p => M`The exponent to apply is \(1/(1-\alpha)\), which comes from dividing \(k\) by \(k^{\alpha}\).` },
          { v: p => pow(p.g / p.nd, p.al.v / (1 - p.al.v)), msg: p => M`\(\alpha/(1-\alpha)\) is the exponent in \(y_{ss}\). For \(k_{ss}\) it's \(1/(1-\alpha)\).` },
          { v: p => pow(p.nd / p.g, 1 / (1 - p.al.v)), msg: p => M`The ratio is upside down: more saving should mean more capital. \(k^{1-\alpha} = \gamma A/(n+\delta)\).` }
        ],
        hint: p => M`Divide both sides by \(k^{\alpha}\) to get \(k^{1-\alpha}\) alone on one side.`,
        steps: p => [
          { prompt: M`After dividing by \(k^{\alpha}\) and \((n+\delta)\), you get \(k^{1-\alpha} = \gamma A/(n+\delta)\). What's the value of the right-hand side?`, answer: () => p.g / p.nd, errors: [{ v: () => p.nd / p.g, msg: p => 'Saving goes on top.' }], hint: p => M`\(${p.g}/${p.nd}\)` },
          { prompt: M`What exponent undoes \(k^{1-\alpha}\)? (Enter \(1/(1-\alpha)\) as a number.)`, answer: () => 1 / (1 - p.al.v), errors: [{ v: () => 1 - p.al.v, msg: p => 'Use the reciprocal.' }], hint: p => M`\(1/(1-${p.al.t})\)` },
          { prompt: M`Raise your first answer to that power: \(k_{ss} = ?\)`, answer: () => pow(p.g / p.nd, 1 / (1 - p.al.v)), hint: p => M`\(${f(p.g / p.nd)}^{${f(1 / (1 - p.al.v))}}\)` }
        ],
        solution: p => M`<p>\(k^{1-\alpha} = ${p.g}/${p.nd} = ${f(p.g / p.nd)}\), so \(k_{ss} = ${f(p.g / p.nd)}^{1/(1-${p.al.t})} = ${f(p.g / p.nd)}^{${f(1 / (1 - p.al.v))}} = ${f(pow(p.g / p.nd, 1 / (1 - p.al.v)))}\).</p>`
      },
      {
        id: 'cs3', type: 'num',
        gen: () => ({ pr: pick([[0.3, 0.15], [0.4, 0.1], [0.25, 0.2], [0.36, 0.09]]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.5, t: '1/2' }]) }),
        prompt: p => M`<p>Two countries have the same \(A\), \(n\) and \(\delta\). Country 1 saves \(\gamma_1 = ${p.pr[0]}\) and country 2 saves \(\gamma_2 = ${p.pr[1]}\). With \(\alpha = ${p.al.t}\), what is the ratio of steady-state incomes \(y_{1}/y_{2}\)?</p>\[y_{ss} = A^{\frac{1}{1-\alpha}}\left(\frac{\gamma}{n+\delta}\right)^{\frac{\alpha}{1-\alpha}}\]`,
        answer: p => pow(p.pr[0] / p.pr[1], p.al.v / (1 - p.al.v)),
        errors: [
          { v: p => p.pr[0] / p.pr[1], msg: p => M`Saving enters with an exponent of \(\alpha/(1-\alpha)\), so the income ratio is the saving ratio raised to that power.` },
          { v: p => pow(p.pr[0] / p.pr[1], 1 / (1 - p.al.v)), msg: p => M`\(1/(1-\alpha)\) is the exponent on \(A\). Saving gets \(\alpha/(1-\alpha)\).` },
          { v: p => pow(p.pr[0] / p.pr[1], p.al.v), msg: p => M`The exponent is \(\alpha/(1-\alpha)\), not \(\alpha\): saving also raises capital, which raises output.` }
        ],
        hint: p => M`Everything except \(\gamma\) cancels in the ratio, leaving \((\gamma_1/\gamma_2)^{\alpha/(1-\alpha)}\).`,
        solution: p => M`<p>\(\frac{y_1}{y_2} = \left(\frac{${p.pr[0]}}{${p.pr[1]}}\right)^{${f(p.al.v / (1 - p.al.v))}} = ${f(p.pr[0] / p.pr[1])}^{${f(p.al.v / (1 - p.al.v))}} = ${f(pow(p.pr[0] / p.pr[1], p.al.v / (1 - p.al.v)))}\).</p>`
      },
      {
        id: 'cs4', type: 'num', unit: 'pct', tol: { abs: 0.1, rel: 0.004 },
        gen: () => ({ q: pick([5, 10, 20]), al: pick([{ v: 1 / 3, t: '1/3' }, { v: 0.5, t: '1/2' }]) }),
        prompt: p => M`<p>TFP \(A\) rises by ${p.q}% with \(\alpha = ${p.al.t}\). In the new steady state, by what percent is output per worker higher? (Exact or log approximation both accepted.)</p>`,
        answer: p => (pow(1 + p.q / 100, 1 / (1 - p.al.v)) - 1) * 100,
        alts: [{ v: p => p.q / (1 - p.al.v), msg: p => M`That's the log approximation, \(\frac{1}{1-\alpha}\times${p.q}\%\). The exact answer is \(${f(1 + p.q / 100)}^{${f(1 / (1 - p.al.v))}} - 1 = ${f((pow(1 + p.q / 100, 1 / (1 - p.al.v)) - 1) * 100, 3)}\%\).` }],
        errors: [
          { v: p => p.q, msg: p => M`That's only the direct effect, holding capital fixed. In the steady state, capital per worker rises too, so \(y_{ss}\propto A^{1/(1-\alpha)}\).` },
          { v: p => p.al.v * p.q, msg: p => M`The exponent on \(A\) in \(y_{ss}\) is \(1/(1-\alpha)\), which is larger than 1.` },
          { v: p => (pow(1 + p.q / 100, p.al.v / (1 - p.al.v)) - 1) * 100, msg: p => M`\(\alpha/(1-\alpha)\) is the exponent on saving. On \(A\) it's \(1/(1-\alpha)\).` }
        ],
        hint: p => M`\(y_{ss}\propto A^{1/(1-\alpha)}\), so \(y_{new}/y_{old} = (A_{new}/A_{old})^{1/(1-\alpha)}\).`,
        solution: p => M`<p>\(y_{new}/y_{old} = ${f(1 + p.q / 100)}^{${f(1 / (1 - p.al.v))}} = ${f(pow(1 + p.q / 100, 1 / (1 - p.al.v)), 5)}\), so output per worker is \(${f((pow(1 + p.q / 100, 1 / (1 - p.al.v)) - 1) * 100, 3)}\%\) higher. The log approximation gives \(${f(1 / (1 - p.al.v))}\times${p.q} = ${f(p.q / (1 - p.al.v))}\%\).</p>`
      }
    ]
  };

  const cesBasics = {
    id: 'ces-basics', title: 'The CES function and σ', lectures: [6, 16, 18],
    summary: 'Read the CES aggregator, convert between θ and σ, and know the special cases.',
    concept: M`
<p>The constant elasticity of substitution (CES) function combines inputs or goods \(x_1, \dots, x_N\):</p>
<div class="rulebox">\[X = \left(\sum_{i=1}^{N} x_i^{\theta}\right)^{1/\theta}, \qquad \theta \le 1, \qquad \sigma = \frac{1}{1-\theta}, \quad \theta = \frac{\sigma-1}{\sigma}\]</div>
<p><b>Order of operations:</b> raise each \(x_i\) to the power \(\theta\), add them up, then raise the sum to \(1/\theta\).</p>
<p>\(\sigma\) is the <b>elasticity of substitution</b>: how easily one input replaces another. The special cases are worth memorizing:</p>
<ul>
<li>\(\theta = 1\) (\(\sigma = \infty\)): <b>perfect substitutes</b>, \(X = x_1 + x_2\).</li>
<li>\(\theta \to 0\) (\(\sigma = 1\)): <b>Cobb-Douglas</b>.</li>
<li>\(\theta < 0\) (\(\sigma < 1\)): <b>complements</b>. Each input is hard to replace.</li>
<li>\(\theta \to -\infty\) (\(\sigma \to 0\)): <b>Leontief</b>, \(X = \min(x_1, x_2)\).</li>
</ul>
<div class="example"><div class="tag">From Lecture 6 · Human capital</div>
<p>With \(Y = [(A_H H)^{\theta} + L^{\theta}]^{1/\theta}\), whether skilled and unskilled workers are substitutes (\(\theta > 0\)) or complements (\(\theta < 0\)) determines whether technology that boosts \(A_H\) raises or lowers the skill premium.</p></div>`,
    problems: [
      {
        id: 'cc1', type: 'num',
        gen: () => ({ t: pick([0.5, 0.8, 0.75, -1, 0.2, 0.9]) }),
        prompt: p => M`<p>A CES function has \(\theta = ${p.t}\). What is the elasticity of substitution \(\sigma\)?</p>`,
        answer: p => 1 / (1 - p.t),
        errors: [
          { v: p => 1 / p.t, msg: p => M`\(\sigma = 1/(1-\theta)\), not \(1/\theta\).` },
          { v: p => 1 - p.t, msg: p => M`Take the reciprocal: \(\sigma = 1/(1-\theta)\).` },
          { v: p => (p.t - 1) / p.t, msg: p => M`That formula goes the other way (\(\theta\) from \(\sigma\)). Here \(\sigma = 1/(1-\theta)\).` }
        ],
        hint: p => M`\(\sigma = 1/(1-\theta)\).`,
        solution: p => M`<p>\(\sigma = 1/(1-(${p.t})) = 1/${f(1 - p.t)} = ${f(1 / (1 - p.t))}\). ${p.t < 0 ? 'Because \\(\\sigma < 1\\), these are complements.' : ''}</p>`
      },
      {
        id: 'cc2', type: 'num',
        gen: () => ({ s: pick([2, 4, 5, 0.5, 1.25, 10]) }),
        prompt: p => M`<p>Going the other way: if \(\sigma = ${p.s}\), what is \(\theta\)?</p>`,
        answer: p => (p.s - 1) / p.s,
        errors: [
          { v: p => 1 / p.s, msg: p => M`Solve \(\sigma = 1/(1-\theta)\) for \(\theta\): \(1-\theta = 1/\sigma\), so \(\theta = 1 - 1/\sigma = (\sigma-1)/\sigma\).` },
          { v: p => 1 - p.s, msg: p => M`\(\theta = 1 - 1/\sigma\), not \(1-\sigma\).` },
          { v: p => p.s / (p.s - 1), msg: p => M`Upside down: \(\theta = (\sigma-1)/\sigma\). (\(\sigma/(\sigma-1)\) is the markup from Lecture 17!)` }
        ],
        hint: p => M`Solve \(\sigma = 1/(1-\theta)\) for \(\theta\).`,
        solution: p => M`<p>\(\theta = (\sigma-1)/\sigma = (${p.s}-1)/${p.s} = ${f((p.s - 1) / p.s)}\).</p>`
      },
      {
        id: 'cc3', type: 'num',
        gen: () => ({ pr: pick([[16, 4], [64, 9], [25, 9], [36, 16], [100, 4]]) }),
        prompt: p => M`<p>Evaluate the CES aggregator with \(\theta = 0.5\) at \(x_1 = ${p.pr[0]}\) and \(x_2 = ${p.pr[1]}\):</p>\[X = \left(x_1^{0.5} + x_2^{0.5}\right)^{1/0.5}\]`,
        answer: p => pow(Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1]), 2),
        errors: [
          { v: p => Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1]), msg: p => M`You're one step short: raise the sum to the power \(1/\theta = 2\).` },
          { v: p => p.pr[0] + p.pr[1], msg: p => M`That's the perfect-substitutes case (\(\theta = 1\)). With \(\theta = 0.5\), take square roots first, add, then square.` },
          { v: p => Math.sqrt(p.pr[0] + p.pr[1]), msg: p => M`Order of operations: raise each \(x_i\) to \(\theta\) first, then add, then raise the sum to \(1/\theta\).` },
          { v: p => pow(p.pr[0] + p.pr[1], 2), msg: p => M`Take square roots of each \(x_i\) <i>before</i> adding.` }
        ],
        hint: p => M`Square roots of each, add, then square the sum.`,
        steps: p => [
          { prompt: M`What is \(x_1^{0.5} + x_2^{0.5}\)?`, answer: () => Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1]), errors: [{ v: () => Math.sqrt(p.pr[0] + p.pr[1]), msg: p => 'Take each square root separately, then add.' }], hint: p => M`\(\sqrt{${p.pr[0]}} + \sqrt{${p.pr[1]}}\)` },
          { prompt: M`Raise that sum to the power \(1/\theta = 2\).`, answer: () => pow(Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1]), 2), hint: p => 'Square it.' }
        ],
        solution: p => M`<p>\(X = (\sqrt{${p.pr[0]}} + \sqrt{${p.pr[1]}})^{2} = (${Math.sqrt(p.pr[0])} + ${Math.sqrt(p.pr[1])})^{2} = ${Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1])}^{2} = ${pow(Math.sqrt(p.pr[0]) + Math.sqrt(p.pr[1]), 2)}\).</p>`
      },
      {
        id: 'cc4', type: 'mc',
        prompt: p => M`<p>Lecture 18 considers AI and human labor combined with \(\sigma = 0.5\). What does that mean?</p>`,
        options: () => [
          { t: 'They are complements: each is hard to replace with the other, so the scarce one limits output.', ok: true, why: M`\(\sigma < 1\) (\(\theta = -1\)) means complements. As AI gets cheap and abundant, human labor becomes the bottleneck, and its share of income rises.` },
          { t: 'They are perfect substitutes.', why: M`Perfect substitutes need \(\sigma = \infty\) (\(\theta = 1\)).` },
          { t: 'It is the Cobb-Douglas case.', why: M`Cobb-Douglas is \(\sigma = 1\).` },
          { t: 'They are fairly close substitutes, so AI replaces workers.', why: M`Substitutes need \(\sigma > 1\). At 0.5 the inputs are complements.` }
        ]
      }
    ]
  };

  const cesVariety = {
    id: 'ces-variety', title: 'Symmetric CES and the love of variety', lectures: [16, 17, 18, 19],
    summary: 'When N varieties are used equally, CES collapses to N^(1/(σ−1)) times total quantity.',
    concept: M`
<p>Suppose total quantity \(Q\) is split evenly over \(N\) varieties, so each gets \(q = Q/N\). Every term in the sum is the same, so the sum is just \(N\) times one term:</p>
<div class="rulebox">\[U = \left(\sum_{i=1}^{N} q^{\theta}\right)^{1/\theta} = \left(N q^{\theta}\right)^{1/\theta} = N^{1/\theta}\,q = N^{1/\theta}\,\frac{Q}{N} = N^{\frac{1}{\theta}-1}\,Q = N^{\frac{1}{\sigma-1}}\,Q\]</div>
<p>The last step uses \(\frac{1}{\theta} - 1 = \frac{1-\theta}{\theta} = \frac{1}{\sigma-1}\), because \(\frac{\theta}{1-\theta} = \sigma - 1\).</p>
<p>So <b>for a fixed total quantity, more varieties mean more utility</b>, by the factor \(N^{1/(\sigma-1)}\). The lower \(\sigma\), the more each new variety is worth. As \(\sigma\to\infty\), the exponent goes to 0 and variety stops mattering.</p>
<p>The same algebra gives the <b>CES price index</b> when all varieties cost \(p\): \(P = N^{1/(1-\sigma)}\,p\). The exponent is negative when \(\sigma>1\), so more variety lowers the price of utility.</p>
<div class="example"><div class="tag">From Lecture 16 · Consumer variety</div>
<p>With \(\theta = 0.5\) (\(\sigma = 2\)), \(Q = 80\) split over 5 varieties gives \(U = (5\times16^{0.5})^{2} = 400 = 5^{1}\times80\). Concentrating it all in one variety gives just 80.</p></div>`,
    problems: [
      {
        id: 'cv1', type: 'num',
        gen: () => ({ N: pick([4, 5, 10, 16]), Q: pick([60, 80, 100]), s: pick([2, 3, 5]) }),
        prompt: p => M`<p>Total quantity \(Q = ${p.Q}\) is split evenly across \(N = ${p.N}\) varieties, and utility is CES with \(\sigma = ${p.s}\). What is utility \(U\)?</p>`,
        answer: p => pow(p.N, 1 / (p.s - 1)) * p.Q,
        errors: [
          { v: p => p.Q, msg: p => M`That would be true with no love of variety (\(\sigma\to\infty\)). With finite \(\sigma\), splitting \(Q\) over \(N\) varieties multiplies utility by \(N^{1/(\sigma-1)}\).` },
          { v: p => p.N * p.Q, msg: p => M`The variety multiplier is \(N^{1/(\sigma-1)}\), which equals \(N\) only when \(\sigma = 2\).` },
          { v: p => pow(p.N, p.s - 1) * p.Q, msg: p => M`The exponent is \(1/(\sigma-1)\), not \(\sigma-1\).` },
          { v: p => pow(p.N, 1 / p.s) * p.Q, msg: p => M`The exponent is \(1/(\sigma-1)\), not \(1/\sigma\).` },
          { v: p => pow(p.N, p.s / (p.s - 1)) * p.Q, msg: p => M`\(N^{\sigma/(\sigma-1)}\) multiplies quantity <i>per variety</i>, \(q = Q/N\), not total \(Q\). Equivalently, \(U = N^{1/(\sigma-1)}Q\).` }
        ],
        hint: p => M`Use the shortcut \(U = N^{1/(\sigma-1)}Q\), or compute \((N q^{\theta})^{1/\theta}\) directly with \(q = Q/N\).`,
        steps: p => [
          { prompt: M`What is \(\theta = (\sigma-1)/\sigma\)?`, answer: () => (p.s - 1) / p.s, hint: p => M`\((${p.s}-1)/${p.s}\)` },
          { prompt: M`What is quantity per variety, \(q = Q/N\)?`, answer: () => p.Q / p.N, hint: p => M`\(${p.Q}/${p.N}\)` },
          { prompt: M`What is the variety multiplier \(N^{1/(\sigma-1)}\)?`, answer: () => pow(p.N, 1 / (p.s - 1)), hint: p => M`\(${p.N}^{1/${p.s - 1}}\)` },
          { prompt: M`Multiply by \(Q\) to get \(U\).`, answer: () => pow(p.N, 1 / (p.s - 1)) * p.Q, hint: p => M`\(${f(pow(p.N, 1 / (p.s - 1)))}\times ${p.Q}\)` }
        ],
        solution: p => M`<p>\(U = N^{1/(\sigma-1)}Q = ${p.N}^{1/${p.s - 1}}\times ${p.Q} = ${f(pow(p.N, 1 / (p.s - 1)))}\times ${p.Q} = ${f(pow(p.N, 1 / (p.s - 1)) * p.Q)}\). Directly: \((${p.N}\cdot ${f(p.Q / p.N)}^{${f((p.s - 1) / p.s)}})^{${f(p.s / (p.s - 1))}}\) gives the same number.</p>`
      },
      {
        id: 'cv2', type: 'num',
        gen: () => ({ s: pick([1.5, 2, 3, 5, 11]) }),
        prompt: p => M`<p>Holding total quantity fixed, the number of varieties doubles. With \(\sigma = ${p.s}\), by what factor does utility rise?</p>`,
        answer: p => pow(2, 1 / (p.s - 1)),
        errors: [
          { v: () => 2, msg: p => M`Only when \(\sigma = 2\) is the factor exactly 2. In general it is \(2^{1/(\sigma-1)}\).` },
          { v: p => pow(2, p.s - 1), msg: p => M`The exponent is \(1/(\sigma-1)\), not \(\sigma-1\). Higher \(\sigma\) should mean variety matters <i>less</i>.` },
          { v: p => pow(2, 1 / p.s), msg: p => M`The exponent is \(1/(\sigma-1)\), not \(1/\sigma\).` },
          { v: () => 1, msg: p => M`Total quantity is fixed, but spreading it over more varieties still raises utility when \(\sigma\) is finite.` }
        ],
        hint: p => M`\(U \propto N^{1/(\sigma-1)}\), so doubling \(N\) multiplies \(U\) by \(2^{1/(\sigma-1)}\).`,
        solution: p => M`<p>\(2^{1/(\sigma-1)} = 2^{1/${f(p.s - 1)}} = ${f(pow(2, 1 / (p.s - 1)))}\). ${p.s >= 5 ? 'With highly substitutable goods, extra variety is worth little.' : 'With poorly substitutable goods, extra variety is worth a lot.'}</p>`
      },
      {
        id: 'cv3', type: 'num',
        gen: () => ({ N: pick([4, 9, 16]), s: pick([2, 3]), p: pick([10, 12, 20]) }),
        prompt: p => M`<p>All \(N = ${p.N}\) varieties sell at price \(p = ${p.p}\), and \(\sigma = ${p.s}\). What is the CES price index \(P = N^{1/(1-\sigma)}\,p\)?</p>`,
        answer: p => pow(p.N, 1 / (1 - p.s)) * p.p,
        errors: [
          { v: p => pow(p.N, 1 / (p.s - 1)) * p.p, msg: p => M`Check the sign of the exponent: it's \(1/(1-\sigma)\), which is negative. More variety <i>lowers</i> the cost of a unit of utility.` },
          { v: p => p.p, msg: p => M`An ordinary average of identical prices would just be \(p\). The CES index also credits the variety itself: \(P = N^{1/(1-\sigma)}p\).` },
          { v: p => p.p / p.N, msg: p => M`The exponent is \(1/(1-\sigma)\), which equals \(-1\) only when \(\sigma = 2\).` }
        ],
        hint: p => M`\(1/(1-\sigma)\) is negative; \(N^{-a} = 1/N^{a}\).`,
        solution: p => M`<p>\(P = ${p.N}^{1/(1-${p.s})}\times ${p.p} = ${p.N}^{${f(1 / (1 - p.s))}}\times${p.p} = ${f(pow(p.N, 1 / (1 - p.s)))}\times ${p.p} = ${f(pow(p.N, 1 / (1 - p.s)) * p.p)}\).</p>`
      },
      {
        id: 'cv4', type: 'mc',
        prompt: p => M`<p>As \(\sigma\to\infty\), what happens to the variety multiplier \(N^{1/(\sigma-1)}\)?</p>`,
        options: () => [
          { t: 'It goes to 1, so variety adds nothing.', ok: true, why: M`The exponent \(1/(\sigma-1)\to 0\) and \(N^{0} = 1\). Perfect substitutes are like wheat from five different farmers: buying from more of them doesn't help.` },
          { t: 'It goes to N.', why: M`It equals \(N\) only at \(\sigma = 2\). As \(\sigma\) grows, the exponent shrinks toward 0.` },
          { t: 'It explodes to infinity.', why: M`That happens as \(\sigma\to 1\) from above (the exponent blows up), as in Lecture 16's \(\sigma = 1.25\) column.` },
          { t: 'It goes to 0.', why: M`\(N^{x}\) with \(x \to 0\) goes to \(N^0 = 1\), not 0.` }
        ]
      }
    ]
  };

  const cesDerivs = {
    id: 'ces-derivatives', title: 'Differentiating CES: wages and shares', lectures: [6, 18],
    summary: 'Use the chain rule to get marginal products, factor shares and relative demand from CES.',
    concept: M`
<p>For \(Y = (A^{\theta} + H^{\theta})^{1/\theta}\), use the <b>chain rule</b>: the derivative of the outside times the derivative of the inside.</p>
<div class="rulebox">\[\frac{\partial Y}{\partial H} = \underbrace{\tfrac{1}{\theta}\left(A^{\theta}+H^{\theta}\right)^{\frac{1}{\theta}-1}}_{\text{outside}}\cdot\underbrace{\theta H^{\theta-1}}_{\text{inside}} = \left(A^{\theta}+H^{\theta}\right)^{\frac{1-\theta}{\theta}} H^{\theta-1} = Y^{1-\theta}H^{\theta-1}\]</div>
<p>The \(\theta\) from the inside cancels the \(1/\theta\) from the outside. The last step uses \((A^{\theta}+H^{\theta})^{(1-\theta)/\theta} = Y^{1-\theta}\).</p>
<p><b>Factor share.</b> If \(H\) is paid its marginal product \(w_H\), its share of output is</p>
<div class="rulebox">\[\frac{w_H H}{Y} = \frac{Y^{1-\theta}H^{\theta}}{Y} = \frac{H^{\theta}}{A^{\theta}+H^{\theta}}\]</div>
<p><b>Relative demand.</b> Dividing the two marginal products gives \(\frac{w_H}{w_A} = \left(\frac{H}{A}\right)^{\theta-1}\), so \(\ln\frac{w_H}{w_A} = -\frac{1}{\sigma}\ln\frac{H}{A}\). This is the log-linear relative demand curve from Lecture 6.</p>
<div class="example"><div class="tag">From Lecture 18 · Input specialization and O-rings</div>
<p>Start with \(A = H = 1\). If AI productivity rises to \(A = 9\): with \(\sigma = 2\) the human share falls from 50% to 25%, but with \(\sigma = 0.5\) it <i>rises</i> to 90%. Whether AI substitutes for or complements people is everything.</p></div>`,
    problems: [
      {
        id: 'cd1', type: 'expr', label: 'Algebra',
        prompt: p => M`<p>Differentiate \(Y = (A^{\theta} + H^{\theta})^{1/\theta}\) with respect to \(H\).</p><p>Use <code>A</code>, <code>H</code> and <code>theta</code>, for example <code>(A^theta + H^theta)^(1/theta)</code>.</p>`,
        vars: { A: [0.5, 3], H: [0.5, 3], theta: [0.15, 0.85] },
        answer: 'H^(theta-1)*(A^theta+H^theta)^(1/theta-1)',
        errors: [
          { e: '(1/theta)*(A^theta+H^theta)^(1/theta-1)', msg: M`That's the outside derivative only. Chain rule: multiply by the derivative of the inside, \(\theta H^{\theta-1}\).` },
          { e: '(1/theta)*(A^theta+H^theta)^(1/theta-1)*H^(theta-1)', msg: M`Close. The inside derivative is \(\theta H^{\theta-1}\), and that \(\theta\) cancels the \(1/\theta\) in front.` },
          { e: 'theta*H^(theta-1)', msg: M`That's only the derivative of the inside. Multiply by the derivative of the outside, \(\frac{1}{\theta}(\cdot)^{1/\theta-1}\).` },
          { e: 'H^(theta-1)*(A^theta+H^theta)^(1/theta)', msg: M`The outside power drops by one: \(\frac{d}{du}u^{1/\theta} = \frac{1}{\theta}u^{1/\theta-1}\).` },
          { e: '(1/theta)*(A^theta+H^theta)^(1/theta-1)*(theta*A^(theta-1)+theta*H^(theta-1))', msg: M`\(A\) is held constant in a partial derivative with respect to \(H\), so the inside derivative is just \(\theta H^{\theta-1}\).` }
        ],
        hint: p => M`Let \(u = A^{\theta}+H^{\theta}\). Then \(Y = u^{1/\theta}\) and \(\partial u/\partial H = \theta H^{\theta-1}\).`,
        solution: p => M`<p>\(\frac{\partial Y}{\partial H} = \frac{1}{\theta}(A^{\theta}+H^{\theta})^{\frac{1}{\theta}-1}\cdot\theta H^{\theta-1} = H^{\theta-1}(A^{\theta}+H^{\theta})^{\frac{1}{\theta}-1}\). Type: <code>H^(theta-1)*(A^theta+H^theta)^(1/theta-1)</code>.</p>`
      },
      {
        id: 'cd2', type: 'num',
        gen: () => ({ s: pick([2, 0.5]), a: pick([4, 9, 16]) }),
        prompt: p => { const t = (p.s - 1) / p.s; return M`<p>Output is \(Y = (A^{\theta}+H^{\theta})^{1/\theta}\) with \(H = 1\) and \(\sigma = ${p.s}\) (so \(\theta = ${f(t)}\)). Before the AI shock, \(A = 1\) and the human wage was \(${f(t === 0.5 ? 2 : 0.25)}\).</p><p>AI productivity rises to \(A = ${p.a}\). What is the new human wage \(w_H = \partial Y/\partial H = Y^{1-\theta}H^{\theta-1}\)?</p>`; },
        answer: p => { const t = (p.s - 1) / p.s; const Y = pow(pow(p.a, t) + 1, 1 / t); return pow(Y, 1 - t); },
        errors: [
          { v: p => { const t = (p.s - 1) / p.s; return pow(pow(p.a, t) + 1, 1 / t); }, msg: p => M`That's output \(Y\). The wage is the marginal product, \(Y^{1-\theta}H^{\theta-1}\), and with \(H = 1\) that's \(Y^{1-\theta}\).` },
          { v: p => (p.s === 2 ? 2 : 0.25), msg: p => M`The wage does change: a more productive partner input changes what an extra unit of \(H\) adds.` },
          { v: p => { const t = (p.s - 1) / p.s; const Y = pow(pow(p.a, t) + 1, 1 / t); return pow(Y, t); }, msg: p => M`The exponent on \(Y\) is \(1-\theta\), not \(\theta\).` }
        ],
        hint: p => M`First compute \(Y\) with the new \(A\). Then \(w_H = Y^{1-\theta}\), since \(H = 1\).`,
        steps: p => {
          const t = (p.s - 1) / p.s; const Y = pow(pow(p.a, t) + 1, 1 / t);
          return [
            { prompt: M`What is \(A^{\theta} = ${p.a}^{${f(t)}}\)?`, answer: () => pow(p.a, t), hint: p => (t === 0.5 ? M`Square root of ${p.a}.` : M`\(${p.a}^{-1} = 1/${p.a}\)`) },
            { prompt: M`What is \(Y = (A^{\theta} + 1)^{1/\theta}\)?`, answer: () => Y, hint: p => M`\((${f(pow(p.a, t))} + 1)^{${f(1 / t)}}\)` },
            { prompt: M`What is \(w_H = Y^{1-\theta}\)?`, answer: () => pow(Y, 1 - t), hint: p => M`\(${f(Y)}^{${f(1 - t)}}\)` }
          ];
        },
        solution: p => { const t = (p.s - 1) / p.s; const Y = pow(pow(p.a, t) + 1, 1 / t); return M`<p>\(\theta = ${f(t)}\): \(Y = (${p.a}^{${f(t)}} + 1)^{${f(1 / t)}} = ${f(Y)}\), so \(w_H = Y^{1-\theta} = ${f(Y)}^{${f(1 - t)}} = ${f(pow(Y, 1 - t))}\). ${p.s === 2 ? 'The human wage rises, but by less than output.' : 'The human wage rises, and labor becomes the bottleneck.'}</p>`; }
      },
      {
        id: 'cd3', type: 'num', unit: 'pct', tol: { abs: 0.1, rel: 0.004 },
        gen: () => ({ s: pick([2, 0.5]), a: pick([4, 9, 16]) }),
        prompt: p => M`<p>Output is \(Y = (A^{\theta}+H^{\theta})^{1/\theta}\) with \(H = 1\) and \(\sigma = ${p.s}\) (\(\theta = ${f((p.s - 1) / p.s)}\)). Before the shock \(A = 1\) and the human share of income was 50%.</p><p>After AI productivity rises to \(A = ${p.a}\), what is the human share \(\dfrac{w_H H}{Y} = \dfrac{H^{\theta}}{A^{\theta}+H^{\theta}}\)?</p>`,
        answer: p => { const t = (p.s - 1) / p.s; return 1 / (pow(p.a, t) + 1) * 100; },
        errors: [
          { v: p => { const t = (p.s - 1) / p.s; return pow(p.a, t) / (pow(p.a, t) + 1) * 100; }, msg: p => M`That's the AI share. The human share has \(H^{\theta}\) on top.` },
          { v: () => 50, msg: p => M`The share changes unless \(\sigma = 1\) (Cobb-Douglas). Plug in the new \(A\).` },
          { v: p => 1 / (p.a + 1) * 100, msg: p => M`Raise \(A\) to the power \(\theta\) before adding.` }
        ],
        hint: p => M`With \(H = 1\), \(H^{\theta} = 1\). Compute \(A^{\theta} = ${p.a}^{${f((p.s - 1) / p.s)}}\).`,
        solution: p => { const t = (p.s - 1) / p.s; return M`<p>\(\frac{1}{${p.a}^{${f(t)}} + 1} = \frac{1}{${f(pow(p.a, t))} + 1} = ${f(1 / (pow(p.a, t) + 1) * 100, 3)}\%\). ${p.s === 2 ? 'As substitutes, more productive AI takes share from people.' : 'As complements, more productive AI makes the scarce human input more valuable, so its share rises.'}</p>`; }
      },
      {
        id: 'cd4', type: 'mc',
        prompt: p => M`<p>Relative demand from CES is \(\ln\dfrac{w_H}{w_L} = \theta\ln A_H + (\theta-1)\ln\dfrac{H}{L}\) (Lecture 6). If the supply of educated workers \(H/L\) rises by 10% and \(\theta = 0.5\), what happens to the skill premium \(w_H/w_L\), holding technology fixed?</p>`,
        options: () => [
          { t: 'It falls by about 5%.', ok: true, why: M`The slope is \(\theta - 1 = -0.5\) (that is, \(-1/\sigma\) with \(\sigma = 2\)), so a 10% rise in relative supply lowers the relative wage by about 5%. This is the "education" side of the race between education and technology.` },
          { t: 'It rises by about 5%.', why: M`More relative supply moves us down the demand curve. The slope \(\theta - 1\) is negative.` },
          { t: 'It falls by about 10%.', why: M`The slope is \(\theta - 1 = -0.5\), not \(-1\).` },
          { t: 'It doesn’t change, because only technology moves the premium.', why: M`Technology shifts the curve (\(\theta\ln A_H\)), but supply moves us along it.` }
        ]
      }
    ]
  };

  const cesComp = {
    id: 'ces-complements', title: 'Complements and bottlenecks', lectures: [18, 20],
    summary: 'When σ < 1 the weakest input limits output, and improving one input alone hits a ceiling.',
    concept: M`
<p>When \(\sigma < 1\), \(\theta\) is negative. A useful case is \(\sigma = 0.5\), so \(\theta = -1\):</p>
<div class="rulebox">\[X = \left(\sum_i x_i^{-1}\right)^{-1} = \frac{1}{\frac{1}{x_1}+\frac{1}{x_2}+\cdots+\frac{1}{x_N}}\]</div>
<p>Small inputs dominate, because \(1/x_i\) is huge when \(x_i\) is small. If any one input goes to zero, \(1/x_i\to\infty\) and \(X\to 0\). That's a <b>bottleneck</b>.</p>
<p>The flip side: improving one input alone hits a ceiling. With two inputs and \(x_2\) fixed, even \(x_1\to\infty\) only gets you to \(X = x_2\) (here, ignoring scaling constants).</p>
<p>Compare the <b>O-ring</b> model in Lecture 18, where output is the <i>product</i> of task success probabilities, \(q_1 q_2\cdots q_n\). It's a different formula with the same message: one weak link drags everything down.</p>
<div class="example"><div class="tag">From Lecture 18 · Input specialization and O-rings</div>
<p>Ten inputs, each equal to 1, with \(\sigma = 0.5\): \(X = 1/10 = 0.10\). Cut just one input to 0.5 and \(X = 1/(9 + 2) = 0.091\). Cut it to 0.1 and \(X = 1/19 = 0.053\). At 0, output is 0.</p></div>`,
    problems: [
      {
        id: 'ck1', type: 'num',
        gen: () => ({ n: pick([5, 10]), v: pick([0.5, 0.25, 0.1]) }),
        prompt: p => M`<p>Output is \(X = \left(\sum_{i=1}^{${p.n}} x_i^{-1}\right)^{-1}\) (\(\sigma = 0.5\)). All ${p.n} inputs equal 1, except that input 1 falls to \(x_1 = ${p.v}\). What is \(X\)?</p>`,
        answer: p => 1 / ((p.n - 1) + 1 / p.v),
        errors: [
          { v: p => 1 / p.n, msg: p => M`That's \(X\) before the change. Now \(1/x_1 = 1/${p.v}\), which is bigger than 1, so the sum of reciprocals grows.` },
          { v: p => p.v, msg: p => M`That would be Leontief, \(\min(x_i)\), which is the \(\sigma\to 0\) limit. With \(\sigma = 0.5\), add up the reciprocals and invert.` },
          { v: p => (p.n - 1) + p.v, msg: p => M`That's perfect substitutes (just add them up). Here you add the <i>reciprocals</i> and then invert.` },
          { v: p => 1 / ((p.n - 1) + p.v), msg: p => M`Take the reciprocal of each input first: \(1/x_1 = 1/${p.v}\), not \(${p.v}\).` },
          { v: p => (p.n - 1) + 1 / p.v, msg: p => M`You have the sum of reciprocals. Now raise it to the power \(-1\), that is, invert it.` }
        ],
        hint: p => M`Add up \(1/x_i\): ${p.n - 1} inputs contribute 1 each, and input 1 contributes \(1/${p.v}\). Then invert the total.`,
        steps: p => [
          { prompt: M`What is \(1/x_1\)?`, answer: () => 1 / p.v, hint: p => M`\(1/${p.v}\)` },
          { prompt: M`What is the sum \(\sum_i 1/x_i\)?`, answer: () => (p.n - 1) + 1 / p.v, hint: p => M`\(${p.n - 1}\times 1 + ${f(1 / p.v)}\)` },
          { prompt: M`Invert it to get \(X\).`, answer: () => 1 / ((p.n - 1) + 1 / p.v), hint: p => M`\(1/${f((p.n - 1) + 1 / p.v)}\)` }
        ],
        solution: p => M`<p>\(X = 1/(${p.n - 1} + 1/${p.v}) = 1/${f((p.n - 1) + 1 / p.v)} = ${f(1 / ((p.n - 1) + 1 / p.v))}\), down from \(1/${p.n} = ${f(1 / p.n)}\): a ${f((1 - p.n / ((p.n - 1) + 1 / p.v)) * 100, 3)}% drop from one weak input.</p>`
      },
      {
        id: 'ck2', type: 'num',
        gen: () => ({ e: pick([2, 4, 8, 100]) }),
        prompt: p => M`<p>From the Lecture 20 appendix: car quality combines engine quality \(e\) and body quality \(b\) as a harmonic mean, \(Q = \dfrac{2}{1/e + 1/b}\) (CES with \(\sigma = 0.5\)). The body stays at \(b = 1\) while engineers push the engine to \(e = ${p.e}\). What is \(Q\)?</p>`,
        answer: p => 2 / (1 / p.e + 1),
        errors: [
          { v: p => (p.e + 1) / 2, msg: p => M`That's the arithmetic mean, which treats the parts as substitutes. The harmonic mean adds reciprocals: \(2/(1/e + 1/b)\).` },
          { v: p => Math.sqrt(p.e), msg: p => M`That's the geometric mean (Cobb-Douglas, \(\sigma = 1\)). Here \(\sigma = 0.5\), so use reciprocals.` },
          { v: p => 1 / (1 / p.e + 1), msg: p => M`Don't forget the 2 in the numerator.` }
        ],
        hint: p => M`\(1/e + 1/b\), then divide 2 by that.`,
        solution: p => M`<p>\(Q = 2/(1/${p.e} + 1) = 2/${f(1 / p.e + 1)} = ${f(2 / (1 / p.e + 1))}\). However good the engine gets, \(Q\) stays below \(2b = 2\). Each engine improvement buys a smaller quality step, so \(\lambda\) shrinks toward 1.</p>`
      },
      {
        id: 'ck3', type: 'mc',
        prompt: p => M`<p>Inputs are complements (\(\sigma < 1\)). One input becomes 10 times more productive while the others stay fixed. Output:</p>`,
        options: () => [
          { t: 'Rises by a bounded amount: the fixed inputs set a ceiling.', ok: true, why: M`With \(\sigma<1\), output is limited by the inputs that didn't improve. This is why cheap AI makes the remaining human tasks more valuable (Lecture 18) and why the quality ladder gets harder to climb (Lecture 20).` },
          { t: 'Rises 10-fold.', why: 'That only happens if every input improves 10-fold, or if the one input were a perfect substitute for the rest.' },
          { t: 'Falls, because the inputs are now unbalanced.', why: 'Improving an input never lowers CES output. It just helps less and less.' },
          { t: 'Doesn’t change at all.', why: M`It does rise, just by a bounded amount. Only in the extreme Leontief case (\(\sigma = 0\)) with this input already non-binding would it not change.` }
        ]
      }
    ]
  };

  /* ===================================================================== */
  /* COURSE MAP                                                              */
  /* ===================================================================== */

  window.MT = {
    intro: 'Short, interactive refreshers on the math used in Econ 432 lectures. Each skill teaches one idea using examples from class, then gives you practice problems with feedback and step-by-step help.',
    lectures: [
      { n: 1, title: 'About this class' }, { n: 2, title: 'The Solow model' }, { n: 3, title: 'Quantifying the Solow model' },
      { n: 4, title: 'Population growth I: Malthus, Solow, Kremer' }, { n: 5, title: 'Population growth II: the demographic transition' },
      { n: 6, title: 'Human capital' }, { n: 9, title: 'AI and human capital' }, { n: 10, title: 'Quantifying human capital' },
      { n: 11, title: 'Measuring productivity' }, { n: 12, title: 'The slowdown in innovation' }, { n: 13, title: 'Allocative efficiency' },
      { n: 14, title: 'Allocative efficiency and structural change' }, { n: 16, title: 'Consumer variety' },
      { n: 17, title: 'Firm entry and inefficient scale' }, { n: 18, title: 'Input specialization and O-rings' },
      { n: 19, title: 'Heterogeneous firms' }, { n: 20, title: 'Creative destruction' }, { n: 21, title: 'Declining dynamism' },
      { n: 22, title: 'Returns to innovation' }, { n: 23, title: 'The nature of technology' }, { n: 24, title: 'Who does the science?' },
      { n: 27, title: 'How ideas spread' }, { n: 28, title: 'How firms get better' }, { n: 29, title: 'So what should we do?' }
    ],
    modules: [
      { id: 'percents', num: 1, planned: true, title: 'Percents, shares and averages', blurb: 'Percent vs. percentage points, shares of a total, weighted averages.',
        plannedSkills: [{ title: 'Percent vs. percentage points', lectures: [17, 21, 24] }, { title: 'Shares and ratios', lectures: [1, 10, 22, 24] }, { title: 'Weighted averages', lectures: [5, 10, 14, 20, 22] }] },
      { id: 'compounding', num: 2, planned: true, title: 'Compounding and growth', blurb: 'Growth paths, doubling times, adding and subtracting growth rates.',
        plannedSkills: [{ title: 'Adding and subtracting growth rates', lectures: [2, 4, 11, 14] }, { title: 'Linear vs. exponential growth', lectures: [4, 12, 23] }] },
      { id: 'exponents', num: 3, planned: true, title: 'Exponent rules', blurb: 'Products of powers, fractional and negative exponents, dividing through by L.',
        plannedSkills: [{ title: 'Fractional and negative exponents', lectures: [3, 16, 17, 18, 19, 23] }, { title: 'Dividing through by L', lectures: [3, 4, 11] }] },
      { id: 'logs', num: 4, title: 'Logarithms', blurb: 'Log rules, growth rates, log differences, log-linear equations and log scales.',
        intro: 'Logs show up in almost every lecture because they turn multiplication into addition and steady growth into straight lines. These five skills cover everything the course asks of them.',
        skills: [logsRules, logsGrowth, logsDiffs, logsSlopes, logsScales] },
      { id: 'derivatives', num: 5, planned: true, title: 'Derivatives', blurb: 'Power rule, partial derivatives, chain rule, first-order conditions, envelope theorem.',
        plannedSkills: [{ title: 'First-order conditions (MR = MC)', lectures: [17, 28] }, { title: 'Cross-partials and complements', lectures: [6, 18] }, { title: 'The envelope theorem', lectures: [28] }] },
      { id: 'elasticities', num: 6, planned: true, title: 'Elasticities and hat algebra', blurb: 'Elasticity as a log derivative, growth-rate algebra, Baumol.',
        plannedSkills: [{ title: 'Elasticity as a log derivative', lectures: [9, 14, 16, 17, 23, 24, 27, 28] }, { title: 'Solving systems in hats (Baumol)', lectures: [14] }] },
      { id: 'dynamics', num: 7, planned: true, title: 'Dynamics and steady states', blurb: 'Stock-flow accumulation, graphical steady states, iterating a model.',
        plannedSkills: [{ title: 'Stock-flow accumulation', lectures: [2, 3] }, { title: 'Graphical steady states and stability', lectures: [2, 3, 4] }, { title: 'Iterating a model step by step', lectures: [3, 21, 23] }] },
      { id: 'cd-ces', num: 8, title: 'Cobb-Douglas and CES', blurb: 'Production functions, marginal products, elasticities, steady states, love of variety and bottlenecks.',
        intro: 'Two functional forms carry most of the models in this course. Cobb-Douglas dominates the first half; CES takes over in the second. These eight skills go from evaluating them to differentiating them.',
        skills: [cdBasics, cdMP, cdElast, cdSteady, cesBasics, cesVariety, cesDerivs, cesComp] },
      { id: 'optimization', num: 9, planned: true, title: 'Optimization and equilibrium', blurb: 'Markups, free entry, cutoffs, comparative statics, areas under curves.',
        plannedSkills: [{ title: 'Markups: σ/(σ−1) and λ', lectures: [17, 19, 20, 21, 28] }, { title: 'Free entry and zero profit', lectures: [17, 19, 20] }, { title: 'Cutoffs and thresholds', lectures: [19, 20, 21] }, { title: 'Comparative statics', lectures: [17, 19, 20, 28] }, { title: 'Areas under curves', lectures: [13, 16] }] },
      { id: 'present-value', num: 10, planned: true, title: 'Present value', blurb: 'Discounting, perpetuities, values that can be lost, benefit/cost ratios.',
        plannedSkills: [{ title: 'Discounting a future payment', lectures: [22, 24] }, { title: 'Perpetuities', lectures: [3, 9, 20, 22] }, { title: 'Values that can be lost: π/(r+x)', lectures: [20] }, { title: 'Benefit/cost ratios', lectures: [22] }] },
      { id: 'probability', num: 11, planned: true, title: 'Probability', blurb: 'Expected value, independent events and O-rings, waiting times, tails.',
        plannedSkills: [{ title: 'Expected value', lectures: [5, 20, 22, 23] }, { title: 'Independent events and O-rings', lectures: [5, 18] }, { title: 'Waiting times', lectures: [20, 21] }, { title: 'Normal and Pareto tails', lectures: [20, 23] }] },
      { id: 'counting', num: 12, planned: true, title: 'Counting and combinatorial growth', blurb: 'Pairs, subsets and recombination.',
        plannedSkills: [{ title: 'Counting pairs and subsets', lectures: [12, 20, 23] }, { title: 'Recombinant growth', lectures: [23] }] },
      { id: 'evidence', num: 13, planned: true, title: 'Reading empirical evidence', blurb: 'Regression coefficients, variance decompositions, natural experiments.',
        plannedSkills: [{ title: 'Variance decomposition', lectures: [11, 28] }, { title: 'Natural experiments and research designs', lectures: [22, 24, 27, 28] }, { title: 'Selection and reverse causality', lectures: [22, 24, 28] }] }
    ]
  };
})();
