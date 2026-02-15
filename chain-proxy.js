/**
 * 链式代理脚本：为名称含「家宽」「落地」的节点设置 underlying-proxy，使其经指定代理组出口。
 * 用法（订阅转换 / subconverter）：
 *   script=chain-proxy.js
 *   script_opts=chain-proxy:mode=auto  或  mode=manual&group=♻️ 自动选择
 * 参数：
 *   mode=auto   按节点名称地区自动选组（香港→🇭🇰 香港节点 等）
 *   mode=manual 全部走同一组，组名由 group= 指定
 *   group=组名  仅 manual 时生效，默认「♻️ 自动选择」
 */

function operator(proxies, targetPlatform, context) {
  const args = typeof $arguments !== "undefined" ? $arguments : (context.arguments || {});
  const mode = (args.mode || "manual").toLowerCase();
  const manualGroup = args.group || "♻️ 自动选择";

  const allowedProtocols = ["ss", "socks5", "http"];

  const ZH = ["香港", "澳门", "台湾", "日本", "韩国", "新加坡", "美国", "英国", "法国", "德国"];
  const EN = ["HK", "MO", "TW", "JP", "KR", "SG", "US", "GB", "FR", "DE"];
  const FG = ["🇭🇰", "🇲🇴", "🇹🇼", "🇯🇵", "🇰🇷", "🇸🇬", "🇺🇸", "🇬🇧", "🇫🇷", "🇩🇪"];
  const QC = ["Hong Kong", "Macao", "Taiwan", "Japan", "Korea", "Singapore", "United States", "United Kingdom", "France", "Germany"];
  // 与 ACL4SSR 等配置中的代理组名一致（含 emoji），便于 Clash 链式代理
  const GROUPS = ["🇭🇰 香港节点", "🌐 其他国家", "🇨🇳 台湾节点", "🇯🇵 日本节点", "🇰🇷 韩国节点", "🇸🇬 狮城节点", "🇺🇲 美国节点", "🌐 其他国家", "🌐 其他国家", "🌐 其他国家"];
  const ORDER = [5, 0, 2, 3, 4, 6, 7, 8, 9]; // 新加坡优先，再香港、台湾…，避免「美国」误匹配「新加坡」

  function needChain(name, type) {
    if (!name || !allowedProtocols.includes(type)) return false;
    return name.includes("家宽") || name.includes("落地");
  }

  function getAutoGroup(name) {
    for (const i of ORDER) {
      if (ZH[i] && name.includes(ZH[i])) return GROUPS[i];
      if (EN[i] && name.includes(EN[i])) return GROUPS[i];
      if (FG[i] && name.includes(FG[i])) return GROUPS[i];
      if (QC[i] && name.includes(QC[i])) return GROUPS[i];
    }
    return "🇭🇰 香港节点";
  }

  for (const proxy of proxies) {
    if (!needChain(proxy.name, proxy.type)) continue;
    proxy["underlying-proxy"] = mode === "auto" ? getAutoGroup(proxy.name) : manualGroup;
  }
  return proxies;
}
