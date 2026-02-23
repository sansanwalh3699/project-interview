// Wandbox API for code execution (free, no API key required)

const WANDBOX_API = "https://wandbox.org/api";

const COMPILER_MAP = {
  javascript: "nodejs-20.17.0",
  python: "cpython-3.10.15",
  java: "openjdk-jdk-22+36",
};

/**
 * Clean code by removing non-printable characters
 * @param {string} code - source code
 * @returns {string} - cleaned code
 */
function cleanCode(code) {
  return code
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\u200C/g, "")
    .replace(/\u200D/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const compiler = COMPILER_MAP[language];

    if (!compiler) {
      return {
        success: false,
        error: `Unsupported language: ${language}. Supported: javascript, python, java`,
      };
    }

    const cleanedCode = cleanCode(code);

    const response = await fetch(`${WANDBOX_API}/compile.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler: compiler,
        code: cleanedCode,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    const compilerError = data.compiler_error || "";
    const programError = data.program_error || "";
    const programOutput = data.program_output || data.program_message || "";

    if (compilerError || programError) {
      return {
        success: false,
        output: programOutput.trim(),
        error: compilerError || programError,
      };
    }

    return {
      success: true,
      output: programOutput.trim() || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}