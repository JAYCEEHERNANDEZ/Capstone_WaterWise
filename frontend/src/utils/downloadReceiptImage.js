const COLORS = {
  accent: "#0284C7",
  accentSoft: "#E0F2FE",
  border: "#E2E8F0",
  muted: "#64748B",
  surface: "#FFFFFF",
  text: "#0F172A",
};

function fitText(context, value, maxWidth) {
  const text = String(value ?? "—");
  if (context.measureText(text).width <= maxWidth) return text;

  let shortened = text;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened}…`;
}

export function downloadReceiptImage({
  filename = "waterwise-receipt.png",
  highlightLastLine = true,
  lines = [],
  title,
}) {
  const canvas = document.createElement("canvas");
  const width = 900;
  const outerPadding = 44;
  const contentPadding = 48;
  const headerHeight = 144;
  const rowHeight = 58;
  const totalHeight = highlightLastLine && lines.length ? 84 : 0;
  const footerHeight = 72;
  const regularLines = highlightLastLine ? lines.slice(0, -1) : lines;
  const totalLine = highlightLastLine ? lines.at(-1) : null;
  const height =
    outerPadding * 2 + headerHeight + regularLines.length * rowHeight + totalHeight + footerHeight;
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  context.fillStyle = "#F8FAFC";
  context.fillRect(0, 0, width, height);

  const cardX = outerPadding;
  const cardY = outerPadding;
  const cardWidth = width - outerPadding * 2;
  const cardHeight = height - outerPadding * 2;

  context.fillStyle = COLORS.surface;
  context.strokeStyle = COLORS.border;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
  context.fill();
  context.stroke();

  const left = cardX + contentPadding;
  const right = cardX + cardWidth - contentPadding;
  const valueWidth = 320;

  context.fillStyle = COLORS.accent;
  context.beginPath();
  context.arc(left + 22, cardY + 46, 22, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = COLORS.surface;
  context.font = "800 18px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText("W", left + 22, cardY + 53);

  context.textAlign = "left";
  context.fillStyle = COLORS.text;
  context.font = "800 24px Inter, system-ui, sans-serif";
  context.fillText("WaterWise", left + 58, cardY + 43);
  context.fillStyle = COLORS.muted;
  context.font = "500 14px Inter, system-ui, sans-serif";
  context.fillText("Sucol Water System", left + 58, cardY + 66);

  context.textAlign = "right";
  context.fillStyle = COLORS.accent;
  context.font = "700 13px Inter, system-ui, sans-serif";
  context.fillText("OFFICIAL RECORD", right, cardY + 42);
  context.fillStyle = COLORS.text;
  context.font = "800 28px Inter, system-ui, sans-serif";
  context.fillText(fitText(context, title || "Receipt", 330), right, cardY + 76);

  let y = cardY + headerHeight;
  context.strokeStyle = COLORS.border;
  context.lineWidth = 1;

  regularLines.forEach(([label, value]) => {
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();

    const baseline = y + 36;
    context.textAlign = "left";
    context.fillStyle = COLORS.muted;
    context.font = "600 16px Inter, system-ui, sans-serif";
    context.fillText(fitText(context, label, 330), left, baseline);

    context.textAlign = "right";
    context.fillStyle = COLORS.text;
    context.font = "700 17px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(fitText(context, value, valueWidth), right, baseline);
    y += rowHeight;
  });

  if (totalLine) {
    y += 12;
    context.fillStyle = COLORS.accentSoft;
    context.beginPath();
    context.roundRect(left, y, right - left, totalHeight - 20, 16);
    context.fill();

    context.textAlign = "left";
    context.fillStyle = COLORS.text;
    context.font = "700 17px Inter, system-ui, sans-serif";
    context.fillText(fitText(context, totalLine[0], 350), left + 22, y + 39);

    context.textAlign = "right";
    context.fillStyle = COLORS.accent;
    context.font = "800 23px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(fitText(context, totalLine[1], valueWidth), right - 22, y + 41);
  }

  context.textAlign = "center";
  context.fillStyle = COLORS.muted;
  context.font = "500 13px Inter, system-ui, sans-serif";
  context.fillText(
    "System-generated receipt • Keep this copy for your records",
    width / 2,
    cardY + cardHeight - 28,
  );

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
