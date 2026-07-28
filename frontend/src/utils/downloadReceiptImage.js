export function downloadReceiptImage({ filename = "waterwise-receipt.png", lines = [], title }) {
  const canvas = document.createElement("canvas");
  const width = 960;
  const lineHeight = 34;
  const padding = 56;
  const height = padding * 2 + 72 + lines.length * lineHeight;
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  context.fillStyle = "#F8FAFC";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#E2E8F0";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(24, 24, width - 48, height - 48, 8);
  context.fill();
  context.stroke();

  context.fillStyle = "#0284C7";
  context.font = "700 18px Inter, system-ui, sans-serif";
  context.fillText("WaterWise", padding, padding + 4);

  context.fillStyle = "#0F172A";
  context.font = "800 34px Inter, system-ui, sans-serif";
  context.fillText(title, padding, padding + 50);

  context.font = "600 20px Inter, system-ui, sans-serif";
  lines.forEach(([label, value], index) => {
    const y = padding + 104 + index * lineHeight;
    context.fillStyle = "#64748B";
    context.fillText(label, padding, y);
    context.fillStyle = "#0F172A";
    context.fillText(String(value), 430, y);
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
