import { createCanvas, CanvasRenderingContext2D } from "canvas";
import * as fs from "fs";
import * as path from "path";
import { CompanyDTO, OilDataDTO } from "../types/models";

export interface CertificateData {
  companyData: CompanyDTO;
  oilData: OilDataDTO[];
  certificationCode: string;
  certificationExpireDate: string;
  certificationNote?: string | null;
}

export class CertificateGeneratorService {
  private readonly WIDTH = 1400;
  private readonly HEIGHT = 980;

  // ── Palette ──────────────────────────────────────────────────────────────────
  private readonly GREEN_DARK = "#1b4332";
  private readonly GREEN_MID = "#2d6a4f";
  private readonly GOLD = "#c8a84b";
  private readonly GOLD_LIGHT = "#e8cc6a";
  private readonly BG = "#ffffff";
  private readonly TEXT_DARK = "#1a1a1a";
  private readonly TEXT_GRAY = "#555555";

  async generateCertificatePng(
    data: CertificateData,
    outputDir?: string,
  ): Promise<{ buffer: Buffer; filePath?: string }> {
    const canvas = createCanvas(this.WIDTH, this.HEIGHT);
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = this.BG;
    ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Wave decorations
    this.drawTopRightDecoration(ctx);
    this.drawBottomLeftDecoration(ctx);

    // Outer border
    this.drawBorder(ctx);

    // Badge (top-left)
    this.drawBadge(ctx, data.certificationCode);

    // Content
    this.drawTitle(ctx);
    this.drawCompanyName(ctx, data.companyData.companyName);
    this.drawDescription(ctx);
    this.drawCertificationDetails(ctx, data.companyData, data.certificationCode);
    this.drawDates(ctx, data.certificationExpireDate);

    const buffer = canvas.toBuffer("image/png");

    if (outputDir) {
      await fs.promises.mkdir(outputDir, { recursive: true });
      const fileName = `${data.certificationCode}.png`;
      const filePath = path.join(outputDir, fileName);
      await fs.promises.writeFile(filePath, buffer);
      return { buffer, filePath };
    }

    return { buffer };
  }

  // ── Decorative waves ─────────────────────────────────────────────────────────

  private drawTopRightDecoration(ctx: CanvasRenderingContext2D) {
    const W = this.WIDTH;
    const H = this.HEIGHT;

    ctx.save();

    // Back dark-green wave — stays tight in top-right corner
    ctx.beginPath();
    ctx.moveTo(W * 0.72, 0);
    ctx.bezierCurveTo(W * 0.82, 0, W * 0.88, H * 0.14, W, H * 0.18);
    ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fillStyle = this.GREEN_DARK;
    ctx.fill();

    // Middle gold wave
    ctx.beginPath();
    ctx.moveTo(W * 0.8, 0);
    ctx.bezierCurveTo(W * 0.87, 0, W * 0.91, H * 0.09, W, H * 0.12);
    ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fillStyle = this.GOLD;
    ctx.fill();

    // Light highlight strip
    ctx.beginPath();
    ctx.moveTo(W * 0.86, 0);
    ctx.bezierCurveTo(W * 0.91, 0, W * 0.94, H * 0.05, W, H * 0.06);
    ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,240,0.5)";
    ctx.fill();

    ctx.restore();
  }

  private drawBottomLeftDecoration(ctx: CanvasRenderingContext2D) {
    const W = this.WIDTH;
    const H = this.HEIGHT;

    ctx.save();

    // Back dark-green wave — stays tight in bottom-left corner
    ctx.beginPath();
    ctx.moveTo(0, H * 0.82);
    ctx.bezierCurveTo(0, H * 0.86, W * 0.18, H * 0.88, W * 0.3, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = this.GREEN_DARK;
    ctx.fill();

    // Middle gold wave
    ctx.beginPath();
    ctx.moveTo(0, H * 0.88);
    ctx.bezierCurveTo(0, H * 0.91, W * 0.11, H * 0.93, W * 0.2, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = this.GOLD;
    ctx.fill();

    // Light highlight strip
    ctx.beginPath();
    ctx.moveTo(0, H * 0.93);
    ctx.bezierCurveTo(0, H * 0.95, W * 0.06, H * 0.96, W * 0.11, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,240,0.5)";
    ctx.fill();

    ctx.restore();
  }

  // ── Border ───────────────────────────────────────────────────────────────────

  private drawBorder(ctx: CanvasRenderingContext2D) {
    const m = 32;
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m, m, this.WIDTH - m * 2, this.HEIGHT - m * 2);
  }

  // ── Badge (top-left) ─────────────────────────────────────────────────────────

  private drawBadge(ctx: CanvasRenderingContext2D, _code: string) {
    const cx = 160;
    const cy = 150;
    const outerR = 66;
    const innerR = 50;
    const spikeR = outerR + 10;
    const points = 16;

    ctx.save();

    // ── Ribbon tabs ────────────────────────────────────────────────────────────
    const ribbonTop = cy + innerR + 2;
    const ribbonH = 50;
    const ribbonW = 26;
    const lg = ctx.createLinearGradient(0, 0, 0, ribbonH);
    lg.addColorStop(0, this.GOLD_LIGHT);
    lg.addColorStop(1, "#9a7520");

    // Left ribbon
    ctx.save();
    ctx.translate(cx - 11, ribbonTop);
    ctx.rotate(-0.28);
    ctx.fillStyle = lg;
    ctx.fillRect(-ribbonW / 2, 0, ribbonW, ribbonH);
    ctx.fillStyle = this.BG;
    ctx.beginPath();
    ctx.moveTo(-ribbonW / 2, ribbonH);
    ctx.lineTo(ribbonW / 2, ribbonH);
    ctx.lineTo(0, ribbonH - 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right ribbon
    ctx.save();
    ctx.translate(cx + 11, ribbonTop);
    ctx.rotate(0.28);
    ctx.fillStyle = lg;
    ctx.fillRect(-ribbonW / 2, 0, ribbonW, ribbonH);
    ctx.fillStyle = this.BG;
    ctx.beginPath();
    ctx.moveTo(-ribbonW / 2, ribbonH);
    ctx.lineTo(ribbonW / 2, ribbonH);
    ctx.lineTo(0, ribbonH - 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ── Starburst / seal ring ──────────────────────────────────────────────────
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? spikeR : outerR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const sealGrad = ctx.createRadialGradient(cx - 14, cy - 14, 8, cx, cy, spikeR);
    sealGrad.addColorStop(0, this.GOLD_LIGHT);
    sealGrad.addColorStop(1, "#8a6810");
    ctx.fillStyle = sealGrad;
    ctx.fill();

    // ── Inner circle ──────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = this.GREEN_DARK;
    ctx.fill();

    // ── "CERTIFIED" label ─────────────────────────────────────────────────────
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = this.GOLD_LIGHT;
    ctx.textAlign = "center";
    ctx.fillText("CERTIFIED", cx, cy - 12);

    // ── Checkmark ────────────────────────────────────────────────────────────
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 8);
    ctx.lineTo(cx - 3, cy + 20);
    ctx.lineTo(cx + 16, cy + 2);
    ctx.stroke();

    ctx.restore();
  }

  // ── Title block ──────────────────────────────────────────────────────────────

  private drawTitle(ctx: CanvasRenderingContext2D) {
    // Shift right to clear the badge
    const cx = this.WIDTH / 2 + 60;

    ctx.save();

    // "CERTOIL"
    ctx.font = "bold 100px serif";
    ctx.fillStyle = this.GREEN_DARK;
    ctx.textAlign = "center";
    ctx.fillText("CERTOIL", cx, 150);

    // "OF QUALITY ANALYSIS" with decorative side lines
    const subtitle = "OF QUALITY ANALYSIS";
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = this.GOLD;
    const sw = ctx.measureText(subtitle).width;
    const lineY = 198;
    const gap = 26;
    const lineLen = 110;

    ctx.strokeStyle = this.GOLD;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - sw / 2 - gap - lineLen, lineY - 2);
    ctx.lineTo(cx - sw / 2 - gap, lineY - 2);
    ctx.stroke();

    ctx.fillText(subtitle, cx, lineY + 4);

    ctx.beginPath();
    ctx.moveTo(cx + sw / 2 + gap, lineY - 2);
    ctx.lineTo(cx + sw / 2 + gap + lineLen, lineY - 2);
    ctx.stroke();

    ctx.restore();
  }

  // ── Company name ─────────────────────────────────────────────────────────────

  private drawCompanyName(ctx: CanvasRenderingContext2D, companyName: string) {
    const cx = this.WIDTH / 2;
    const y = 360;

    ctx.save();

    // Large italic serif in gold (mimics script font from reference)
    ctx.font = "italic bold 68px serif";
    ctx.fillStyle = this.GOLD;
    ctx.textAlign = "center";
    ctx.fillText(this.truncate(companyName, 36), cx, y);

    // Underline
    const nameW = Math.min(ctx.measureText(this.truncate(companyName, 36)).width + 40, 900);
    ctx.beginPath();
    ctx.moveTo(cx - nameW / 2, y + 18);
    ctx.lineTo(cx + nameW / 2, y + 18);
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // ── Description paragraph ────────────────────────────────────────────────────

  private drawDescription(ctx: CanvasRenderingContext2D) {
    const cx = this.WIDTH / 2;
    const lines = [
      "This certificate is awarded to the above-mentioned company in recognition of",
      "compliance with quality standards in olive oil production and processing,",
      "as verified and certified by CERTOIL.",
    ];

    ctx.save();
    ctx.font = "18px serif";
    ctx.fillStyle = this.TEXT_GRAY;
    ctx.textAlign = "center";

    let y = 424;
    for (const line of lines) {
      ctx.fillText(line, cx, y);
      y += 33;
    }

    ctx.restore();
  }

  // ── Unique certification details ─────────────────────────────────────────────

  private drawCertificationDetails(
    ctx: CanvasRenderingContext2D,
    _company: CompanyDTO,
    certCode: string,
  ) {
    const cx = this.WIDTH / 2;
    const startY = 548;

    ctx.save();

    // Section label
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = this.GREEN_MID;
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATION DETAILS", cx, startY);

    // Divider
    ctx.beginPath();
    ctx.moveTo(cx - 110, startY + 10);
    ctx.lineTo(cx + 110, startY + 10);
    ctx.strokeStyle = this.GREEN_DARK;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Single item: Certification Code
    const items: { label: string; value: string }[] = [
      { label: "Certification Code", value: certCode },
    ];

    const colWidth = 360;
    const totalWidth = items.length * colWidth;
    const startX = cx - totalWidth / 2 + colWidth / 2;

    items.forEach((item, i) => {
      const x = startX + i * colWidth;
      const y = startY + 50;

      // Value — bold, larger monospace
      ctx.font = "bold 30px monospace";
      ctx.fillStyle = this.GREEN_DARK;
      ctx.textAlign = "center";
      ctx.fillText(this.truncate(item.value, 20), x, y);

      // Label below
      ctx.font = "13px sans-serif";
      ctx.fillStyle = this.TEXT_GRAY;
      ctx.fillText(item.label, x, y + 24);

      // Vertical separator between columns (except after the last)
      if (i < items.length - 1) {
        const sepX = x + colWidth / 2;
        ctx.beginPath();
        ctx.moveTo(sepX, startY + 28);
        ctx.lineTo(sepX, startY + 82);
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // ── Dates (bottom, replacing signatures) ─────────────────────────────────────

  private drawDates(ctx: CanvasRenderingContext2D, expireDate: string) {
    const H = this.HEIGHT;
    const W = this.WIDTH;

    const issued = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const expires = new Date(expireDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const leftX = W * 0.28;
    const rightX = W * 0.72;
    const lineY = H - 148;
    const lineHalf = 100;

    ctx.save();

    // Left: Issue date
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX - lineHalf, lineY);
    ctx.lineTo(leftX + lineHalf, lineY);
    ctx.stroke();

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = this.TEXT_DARK;
    ctx.textAlign = "center";
    ctx.fillText(issued, leftX, lineY + 34);

    ctx.font = "15px sans-serif";
    ctx.fillStyle = this.TEXT_GRAY;
    ctx.fillText("Issue Date", leftX, lineY + 56);

    // Right: Expiry date
    ctx.strokeStyle = "#444444";
    ctx.beginPath();
    ctx.moveTo(rightX - lineHalf, lineY);
    ctx.lineTo(rightX + lineHalf, lineY);
    ctx.stroke();

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = this.TEXT_DARK;
    ctx.fillText(expires, rightX, lineY + 34);

    ctx.font = "15px sans-serif";
    ctx.fillStyle = this.TEXT_GRAY;
    ctx.fillText("Expiry Date", rightX, lineY + 56);

    ctx.restore();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────

  private truncate(text: string, maxLen: number): string {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
  }
}
