// ================= VARIABLES =================
let display = document.getElementById("display");
let expression = "";
let mode = "DEG"; // DEG or RAD
let second = false;

// ================= INITIAL DISPLAY =================
display.innerText = "0";

// ================= INPUT =================
function press(val) {
  if (expression === "Error") expression = "";
  expression += val;
  display.innerText = expression;
}

//=================INSERT OPERATORS===================
function insertOperator(op) {
  const operators = ["+", "-", "*", "/", "×", "÷", "%", "^"];

  // Prevent % or ^ as the first character
  if ((op === "%" || op === "^") && expression === "") return;

  if (expression === "" && op !== "-") return; // first char minus allowed
  const lastChar = expression.slice(-1);

  // Fix consecutive operators
  if (operators.includes(lastChar)) {
    if (op === "-" && lastChar !== "-") {
      expression += op;
    } else {
      expression = expression.slice(0, -1) + op;
    }
  } else {
    expression += op;
  }

  display.innerText = expression;
}

// ================= DECIMAL INPUT =================
function pressDot() {
  const tokens = expression.split(/[\+\-\*\/×÷\%\^]/);
  let lastToken = tokens[tokens.length - 1];

  if (lastToken === "") {
    expression += "0.";
  } else if (!lastToken.includes(".")) {
    expression += ".";
  }

  display.innerText = expression;
}

// ================= CLEAR AND BACKSPACE =================
function clearAll() {
  expression = "";
  display.innerText = "0";
}
function backspace() {
  expression = expression.slice(0, -1);
  display.innerText = expression || "0";
}

// ================= TOGGLES =================
function toggleDegRad() {
  mode = mode === "DEG" ? "RAD" : "DEG";
  document.getElementById("degRad").innerText = mode;
}
function toggleSecond() {
  second = !second;
  document.getElementById("sin").innerText = second ? "sin⁻¹" : "sin";
  document.getElementById("cos").innerText = second ? "cos⁻¹" : "cos";
  document.getElementById("tan").innerText = second ? "tan⁻¹" : "tan";
}

// ================= TRIG FUNCTIONS =================
window.toRad = (x) => (x * Math.PI) / 180;
window.toDeg = (x) => (x * 180) / Math.PI;

window.sin = (x) => {
  if (second) return Math.asin(mode === "DEG" ? (x * Math.PI) / 180 : x);
  return Math.sin(mode === "DEG" ? (x * Math.PI) / 180 : x);
};

window.cos = (x) => {
  if (second) return Math.acos(mode === "DEG" ? (x * Math.PI) / 180 : x);
  return Math.cos(mode === "DEG" ? (x * Math.PI) / 180 : x);
};

window.tan = (x) => {
  let val = mode === "DEG" ? (x * Math.PI) / 180 : x;
  if (!second && mode === "DEG" && Math.abs(val - Math.PI / 2) < 1e-10)
    return Infinity;
  return second ? Math.atan(val) : Math.tan(val);
};

window.asin = (x) => (mode === "DEG" ? toDeg(Math.asin(x)) : Math.asin(x));
window.acos = (x) => (mode === "DEG" ? toDeg(Math.acos(x)) : Math.acos(x));
window.atan = (x) => (mode === "DEG" ? toDeg(Math.atan(x)) : Math.atan(x));

// ================= SCIENTIFIC FUNCTIONS =================
window.ln = (x) => Math.log(x);
window.log = (x) => Math.log10(x);
window.sqrt = (x) => Math.sqrt(x);
window.pow = (x, y) => Math.pow(x, y);
window.factorial = (n) => {
  if (n < 0) return NaN;
  if (n <= 1) return 1;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
};
window.inv = (x) => 1 / x;

// ================= PRESS TRIG =================
function pressTrig(func) {
  if (second) {
    if (func === "sin") press("asin(");
    else if (func === "cos") press("acos(");
    else if (func === "tan") press("atan(");
  } else {
    if (func === "sin") press("sin(");
    else if (func === "cos") press("cos(");
    else if (func === "tan") press("tan(");
  }
}

// ================= FACTORIAL BUTTON =================
function pressFactorial() {
  if (expression === "" || expression === "Error") {
    expression = "0!";
  } else {
    expression += "!";
  }
  display.innerText = expression;
}

// ================= CALCULATE =================
function calculate() {
  try {
    let exp = expression;

    // ===== SMART π REPLACEMENT =====
    exp = exp.replace(/(\d|\))\s*π/g, "$1*Math.PI");
    exp = exp.replace(/π\s*(\d|\(|!)/g, "Math.PI*$1");
    exp = exp.replace(/π/g, "Math.PI");

    // ===== Operators and exponent/factorial replacements =====
    exp = exp.replace(/×/g, "*").replace(/÷/g, "/");
    exp = exp.replace(/\^/g, "**");
    exp = exp.replace(/(\d+)!/g, (_, n) => factorial(Number(n)));

    // ===== Auto-close parentheses =====
    let open = (exp.match(/\(/g) || []).length;
    let close = (exp.match(/\)/g) || []).length;
    if (open > close) exp += ")".repeat(open - close);

    // ===== IMPLICIT MULTIPLICATION =====
    exp = exp.replace(
      /(\d|\))(?=\s*(sin|cos|tan|asin|acos|atan|ln|log|sqrt|inv))/g,
      "$1*",
    );

    // ===== DIVISION BY ZERO CHECK =====
    if (/\/\s*0(\D|$)/.test(exp)) {
      expression = "Undefined";
      display.innerText = expression;
      return;
    }

    // ===== FINAL EVAL =====
    let result = eval(exp);

    // ===== DISPLAY FORMATTING =====
    if (result === Infinity || result === -Infinity) {
      expression = "Infinity";
    } else if (Number.isNaN(result)) {
      expression = "Undefined";
    } else if (Number.isInteger(result)) {
      expression = result.toString();
    } else {
      expression = parseFloat(result.toFixed(10)).toString();
    }

    display.innerText = expression;
  } catch {
    display.innerText = "Error";
    expression = "Error";
  }
}
