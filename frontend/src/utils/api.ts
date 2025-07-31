export async function processExcel(file: File, ranges: any): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ranges", JSON.stringify(ranges));

  const res = await fetch("http://localhost:8000/process-excel/", {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Failed to process file");

  const data = await res.json();
  return data.images.map((url: string) => `http://localhost:8000${url}`);
}
