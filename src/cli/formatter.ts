export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function outputError(error: unknown): void {
  if (error instanceof Error) {
    console.error(JSON.stringify({ error: error.name, message: error.message }, null, 2));
  } else {
    console.error(JSON.stringify({ error: "UnknownError", message: String(error) }, null, 2));
  }
  process.exit(1);
}
