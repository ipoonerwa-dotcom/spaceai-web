import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "zh" | "en" | "ja" | "ko";

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "zh", label: "简体中文", short: "中" },
  { code: "en", label: "English", short: "EN" },
  { code: "ja", label: "日本語", short: "日" },
  { code: "ko", label: "한국어", short: "한" },
];

/** Flat key -> per-language string. Missing keys fall back to English, then the key. */
const D: Record<string, Record<Lang, string>> = {
  // ---------- nav ----------
  "nav.vision": { zh: "愿景", en: "Vision", ja: "ビジョン", ko: "비전" },
  "nav.modules": { zh: "核心机制", en: "Modules", ja: "コア機構", ko: "핵심 구조" },
  "nav.economy": { zh: "经济模型", en: "Economy", ja: "経済モデル", ko: "경제 모델" },
  "nav.roadmap": { zh: "路线图", en: "Roadmap", ja: "ロードマップ", ko: "로드맵" },
  "nav.home": { zh: "首页", en: "Home", ja: "ホーム", ko: "홈" },
  "nav.bank": { zh: "星际银行", en: "Stellar Bank", ja: "ステラバンク", ko: "스텔라 뱅크" },
  "nav.enter": { zh: "进入应用", en: "Open App", ja: "アプリを開く", ko: "앱 열기" },
  "nav.enterFull": { zh: "进入星际银行 →", en: "Open Stellar Bank →", ja: "ステラバンクへ →", ko: "스텔라 뱅크 →" },

  // ---------- wallet ----------
  "w.connect": { zh: "连接钱包", en: "Connect Wallet", ja: "ウォレット接続", ko: "지갑 연결" },
  "w.title": { zh: "连接钱包", en: "Connect a wallet", ja: "ウォレットを接続", ko: "지갑 연결" },
  "w.sub": { zh: "连接即登录,地址就是你的账户,无需注册。", en: "Connecting is logging in — your address is your account. No sign-up.", ja: "接続がログインです。アドレスがそのままアカウントになります。登録は不要です。", ko: "연결이 곧 로그인입니다. 주소가 계정이며 가입이 필요 없습니다." },
  "w.network": { zh: "网络 · BNB SMART CHAIN (56)", en: "NETWORK · BNB SMART CHAIN (56)", ja: "ネットワーク · BNB SMART CHAIN (56)", ko: "네트워크 · BNB SMART CHAIN (56)" },
  "w.browser": { zh: "浏览器钱包", en: "Browser wallet", ja: "ブラウザウォレット", ko: "브라우저 지갑" },
  "w.connecting": { zh: "确认中…", en: "Confirm in wallet…", ja: "ウォレットで承認…", ko: "지갑에서 승인…" },
  "w.doConnect": { zh: "连接", en: "Connect", ja: "接続", ko: "연결" },
  "w.none": { zh: "未检测到钱包。请先安装 MetaMask、OKX 或 TokenPocket。", en: "No wallet detected. Install MetaMask, OKX or TokenPocket first.", ja: "ウォレットが見つかりません。MetaMask、OKX、TokenPocket などを先にインストールしてください。", ko: "지갑이 감지되지 않았습니다. MetaMask, OKX 또는 TokenPocket을 먼저 설치하세요." },
  "w.cancelled": { zh: "你在钱包中取消了连接。", en: "Connection cancelled in your wallet.", ja: "ウォレットで接続がキャンセルされました。", ko: "지갑에서 연결이 취소되었습니다." },
  "w.copy": { zh: "复制地址", en: "Copy address", ja: "アドレスをコピー", ko: "주소 복사" },
  "w.disconnect": { zh: "断开连接", en: "Disconnect", ja: "切断", ko: "연결 해제" },
  "w.switch": { zh: "切换到 BSC", en: "Switch to BSC", ja: "BSC に切替", ko: "BSC로 전환" },

  // ---------- hero ----------
  "h.chip": { zh: "AI × DEFI · 星际价值共振", en: "AI × DEFI · INTERSTELLAR VALUE RESONANCE", ja: "AI × DEFI · 星間バリューレゾナンス", ko: "AI × DEFI · 인터스텔라 가치 공명" },
  "h.title1": { zh: "以 AI 踏碎", en: "Break through the", ja: "AI で切り拓く", ko: "AI로 개척하는" },
  "h.title2": { zh: "星海征途", en: "sea of stars", ja: "星海の航路", ko: "별들의 항로" },
  "h.sub": {
    zh: "SPACEAI 把链上银行的记账单位从代币换成美金。存入即锁定本金的美金价值,利息按日复利滚存,到期兑付等值代币 —— 币价的涨跌,不再决定你账本上的数字。",
    en: "SPACEAI denominates its on-chain bank in dollars, not tokens. Your principal's USD value is locked the moment you deposit, interest compounds daily, and maturity pays out the equivalent in tokens — price swings no longer decide the number on your ledger.",
    ja: "SPACEAI はオンチェーンバンクの記帳単位をトークンではなく米ドルにしました。入金した瞬間に元本のドル価値が固定され、利息は日次で複利運用され、満期には同等額のトークンで支払われます。価格変動が、あなたの帳簿の数字を左右しません。",
    ko: "SPACEAI는 온체인 뱅크의 회계 단위를 토큰이 아닌 달러로 삼습니다. 예치하는 순간 원금의 USD 가치가 고정되고, 이자는 매일 복리로 쌓이며, 만기에는 동일 가치의 토큰으로 지급됩니다. 시세 등락이 장부의 숫자를 결정하지 않습니다.",
  },
  "h.cta1": { zh: "进入星际银行", en: "Open Stellar Bank", ja: "ステラバンクへ", ko: "스텔라 뱅크 열기" },
  "h.cta2": { zh: "了解运行机制", en: "How it works", ja: "仕組みを見る", ko: "작동 방식" },
  "h.note": { zh: "连接钱包即登录 · 无需注册 · 部署于 BNB SMART CHAIN", en: "WALLET IS YOUR LOGIN · NO SIGN-UP · DEPLOYED ON BNB SMART CHAIN", ja: "ウォレットでログイン · 登録不要 · BNB SMART CHAIN 上で稼働", ko: "지갑으로 로그인 · 가입 불필요 · BNB SMART CHAIN 배포" },

  // ---------- marquee ----------
  "m.1": { zh: "金本位记账", en: "Gold-standard ledger", ja: "ゴールドスタンダード記帳", ko: "골드 스탠더드 원장" },
  "m.2": { zh: "每日复利", en: "Daily compounding", ja: "日次複利", ko: "일일 복리" },
  "m.3": { zh: "到期兑付", en: "Maturity settlement", ja: "満期決済", ko: "만기 정산" },
  "m.4": { zh: "报价护栏", en: "Oracle guardrails", ja: "オラクル・ガードレール", ko: "오라클 가드레일" },
  "m.5": { zh: "国库兑付", en: "Treasury backing", ja: "トレジャリー保証", ko: "트레저리 보증" },
  "m.6": { zh: "AI × DEFI 星际价值共振", en: "AI × DEFI VALUE RESONANCE", ja: "AI × DEFI バリューレゾナンス", ko: "AI × DEFI 가치 공명" },

  // ---------- vision ----------
  "v.kicker": { zh: "VISION · 新秩序", en: "VISION · NEW ORDER", ja: "VISION · 新秩序", ko: "VISION · 새로운 질서" },
  // NOTE: title1 renders immediately before the gradient <span>. Latin/Korean need a
  // trailing space; CJK ends on full-width punctuation and must not have one.
  "v.title1": { zh: "价值的刻度,", en: "The measure of value ", ja: "価値の目盛りは、", ko: "가치의 척도는 " },
  "v.title2": { zh: "不该随情绪漂移", en: "should not drift with sentiment", ja: "感情で揺らぐべきではない", ko: "감정에 흔들려서는 안 됩니다" },
  "v.lead": {
    zh: "链上收益的痛点从来不是「数字不够大」,而是数字本身在漂。以代币计价的账本,在下跌中会悄悄蒸发;而以美金计价的账本,把波动的代价交还给协议,把确定性留给持有者。",
    en: "The problem with on-chain yield was never that the numbers were too small — it is that the numbers themselves drift. A token-denominated ledger quietly evaporates in a drawdown. A dollar-denominated one hands volatility back to the protocol and leaves certainty with the holder.",
    ja: "オンチェーン収益の課題は「数字が小さいこと」ではなく、数字そのものが揺れることでした。トークン建ての帳簿は下落局面で静かに目減りします。ドル建ての帳簿は、変動のコストをプロトコルが引き受け、確実性を保有者に残します。",
    ko: "온체인 수익의 문제는 '숫자가 작다'가 아니라 숫자 자체가 흔들린다는 점이었습니다. 토큰 기준 장부는 하락장에서 조용히 증발합니다. 달러 기준 장부는 변동성의 비용을 프로토콜이 지고, 확실성을 보유자에게 남깁니다.",
  },
  "v.c1t": { zh: "以美金为锚", en: "Anchored in dollars", ja: "ドルを基準に", ko: "달러 기준" },
  "v.c1d": { zh: "本金与利息全部以 USD 计价,币价波动不改变你账户上的数字。", en: "Principal and interest are denominated in USD — price swings do not change the number in your account.", ja: "元本も利息も USD 建て。価格変動はアカウントの数字を変えません。", ko: "원금과 이자 모두 USD 기준 — 시세 변동이 계좌의 숫자를 바꾸지 않습니다." },
  "v.c2t": { zh: "以复利为引擎", en: "Powered by compounding", ja: "複利をエンジンに", ko: "복리 엔진" },
  "v.c2d": { zh: "利息按日滚入本金基数,不领取即持续复利,时间成为盟友。", en: "Interest rolls into the base daily; leave it untouched and it keeps compounding. Time works for you.", ja: "利息は日々元本に組み入れられ、引き出さなければ複利が続きます。時間が味方になります。", ko: "이자는 매일 원금에 편입되며, 인출하지 않으면 복리가 계속됩니다. 시간이 아군이 됩니다." },
  "v.c3t": { zh: "以合约为信用", en: "Credit from code", ja: "コントラクトが信用", ko: "컨트랙트가 신용" },
  "v.c3d": { zh: "利率、周期、兑付路径全部写入合约,规则对所有地址一视同仁。", en: "Rates, terms and settlement paths live in the contract — the same rules for every address.", ja: "金利・期間・決済経路はすべてコントラクトに記述され、すべてのアドレスに同じルールが適用されます。", ko: "금리·기간·정산 경로가 모두 컨트랙트에 기록되어 모든 주소에 동일하게 적용됩니다." },
  "v.c4t": { zh: "以国库为后盾", en: "Backed by the treasury", ja: "トレジャリーが後ろ盾", ko: "트레저리가 뒷받침" },
  "v.c4d": { zh: "兑付缺口由国库自动补足,储备与授权额度链上随时可查。", en: "Settlement shortfalls are topped up from the treasury; reserves and allowances are verifiable on-chain.", ja: "決済不足はトレジャリーが自動補填し、準備金と承認枠はオンチェーンで確認できます。", ko: "정산 부족분은 트레저리가 자동 보충하며, 준비금과 승인 한도는 온체인에서 확인 가능합니다." },

  // ---------- modules ----------
  "mo.kicker": { zh: "CORE MODULES · 核心机制", en: "CORE MODULES", ja: "CORE MODULES · コア機構", ko: "CORE MODULES · 핵심 구조" },
  "mo.title1": { zh: "五个模块,", en: "Five modules, ", ja: "5 つのモジュールが", ko: "다섯 개의 모듈이 " },
  "mo.title2": { zh: "构成一台完整的银行", en: "one complete bank", ja: "一つの銀行を構成する", ko: "하나의 은행을 이룹니다" },
  "mo.lead": {
    zh: "记账、计息、锁仓、报价、兑付 —— 每个环节都由合约执行,彼此校验,形成一套可验证、可持续的价值秩序。",
    en: "Ledger, accrual, lock-up, pricing and settlement — every step is executed by the contract and checked against the others, forming a verifiable, sustainable order of value.",
    ja: "記帳・利息・ロック・価格・決済 —— 各工程はコントラクトが実行し相互に検証され、検証可能で持続的な価値の秩序を形づくります。",
    ko: "기록·이자·락업·가격·정산 — 모든 단계를 컨트랙트가 실행하고 서로 검증하여, 검증 가능하고 지속 가능한 가치 질서를 만듭니다.",
  },
  "mo.1t": { zh: "金本位记账", en: "Gold-Standard Accounting", ja: "ゴールドスタンダード記帳", ko: "골드 스탠더드 회계" },
  "mo.1d": { zh: "存入的那一刻,系统按当时价格把你的本金折算成一个美金数并锁定。此后账本只认这个数字,不再随币价重估。", en: "At deposit the system converts your principal into a dollar figure at the prevailing price and locks it. From then on the ledger recognises only that number — never re-marked to price.", ja: "入金時点の価格で元本をドル建てに換算し固定します。以後、帳簿はその数字のみを認識し、価格による再評価は行いません。", ko: "예치 시점의 가격으로 원금을 달러 금액으로 환산해 고정합니다. 이후 장부는 그 숫자만 인식하며 시세로 재평가하지 않습니다." },
  "mo.1p1": { zh: "入金即锁定美金价值", en: "USD value locked at deposit", ja: "入金時にドル価値を固定", ko: "예치 시 USD 가치 고정" },
  "mo.1p2": { zh: "币价下跌时兑付更多代币", en: "More tokens paid out when price falls", ja: "価格下落時はより多くのトークンで支払い", ko: "시세 하락 시 더 많은 토큰 지급" },
  "mo.1p3": { zh: "账目以 USD 计价、可核对", en: "USD-denominated, auditable records", ja: "USD 建てで照合可能な記録", ko: "USD 기준의 대조 가능한 기록" },

  "mo.2t": { zh: "复利账户", en: "Compounding Account", ja: "複利アカウント", ko: "복리 계좌" },
  "mo.2d": { zh: "利息按日复利滚入账户,不领取就持续利滚利。想用随时可取,支持全额领取或只领一部分,剩下的继续滚。", en: "Interest compounds daily into the account and keeps rolling if untouched. Withdraw any time — in full or in part; whatever stays keeps compounding.", ja: "利息は日次でアカウントに複利計上され、放置すれば増え続けます。いつでも全額または一部を引き出せ、残りは複利を継続します。", ko: "이자는 매일 계좌에 복리로 쌓이며 그대로 두면 계속 불어납니다. 언제든 전액 또는 일부 인출이 가능하고, 남은 금액은 계속 복리됩니다." },
  "mo.2p1": { zh: "每日复利,不领即滚存", en: "Daily compounding while unclaimed", ja: "未受取なら日次で複利", ko: "미수령 시 매일 복리" },
  "mo.2p2": { zh: "可全领,也可部分领", en: "Claim in full or in part", ja: "全額でも一部でも受取可", ko: "전액 또는 일부 수령" },
  "mo.2p3": { zh: "剩余部分基数不变继续计息", en: "Remainder keeps its compounding base", ja: "残額は複利ベースを維持", ko: "잔액은 복리 기준을 유지" },

  "mo.3t": { zh: "定期锁仓", en: "Term Lock", ja: "定期ロック", ko: "정기 락업" },
  "mo.3d": { zh: "三档周期对应三档日化。本金整期锁定,到期一次性按当时价格兑付回等值美金的代币。", en: "Three terms, three daily rates. Principal is locked for the full term and settled in one payment at maturity, in tokens worth the locked dollar amount.", ja: "3 つの期間に 3 つの日利。元本は全期間ロックされ、満期時に固定ドル額相当のトークンで一括支払いされます。", ko: "세 가지 기간, 세 가지 일이율. 원금은 전 기간 락업되며 만기에 고정된 달러 금액 상당의 토큰으로 일괄 지급됩니다." },
  "mo.3p1": { zh: "90 / 180 / 360 天三档", en: "90 / 180 / 360-day terms", ja: "90 / 180 / 360 日の 3 種", ko: "90 / 180 / 360일 3종" },
  "mo.3p2": { zh: "本金到期一次性解锁", en: "Principal unlocks in one lump at maturity", ja: "元本は満期に一括解除", ko: "원금은 만기에 일괄 해제" },
  "mo.3p3": { zh: "锁仓期内利息随时可领", en: "Interest claimable throughout the term", ja: "期間中も利息はいつでも受取可", ko: "기간 중 이자는 언제든 수령" },

  "mo.4t": { zh: "报价护栏", en: "Oracle Guardrails", ja: "オラクル・ガードレール", ko: "오라클 가드레일" },
  "mo.4d": { zh: "结算价由预言机按稳健价源推送,并受三重链上护栏约束,不直接采用可被瞬时操纵的池子现价。", en: "The settlement price is pushed by an oracle from robust sources and bounded by three on-chain guardrails — never the raw pool price, which can be moved in a single transaction.", ja: "決済価格は堅牢な価格源からオラクルが送信し、3 重のオンチェーン・ガードレールで制約されます。単一取引で操作され得るプール現在値は直接使いません。", ko: "정산 가격은 견고한 가격원에서 오라클이 전송하며 3중 온체인 가드레일로 제한됩니다. 단일 거래로 조작 가능한 풀 현재가를 직접 쓰지 않습니다." },
  "mo.4p1": { zh: "偏离现价超阈值即拒绝", en: "Rejected if it deviates from spot", ja: "現在値から乖離すれば拒否", ko: "현재가에서 이탈하면 거부" },
  "mo.4p2": { zh: "单次调价幅度受限", en: "Per-update move is capped", ja: "1 回あたりの変動幅を制限", ko: "1회 변동 폭 제한" },
  "mo.4p3": { zh: "超时未更新自动冻结提取", en: "Stale price freezes withdrawals", ja: "更新切れで引出を凍結", ko: "가격 만료 시 인출 동결" },

  "mo.5t": { zh: "国库兑付", en: "Treasury Settlement", ja: "トレジャリー決済", ko: "트레저리 정산" },
  "mo.5d": { zh: "合约余额不足以支付本息时,自动从国库补足。国库储备与授权额度链上可查,兑付能力透明。", en: "When the contract balance cannot cover principal or interest, the treasury tops it up automatically. Reserves and allowances are visible on-chain, so settlement capacity is transparent.", ja: "コントラクト残高が元利払いに不足する場合、トレジャリーが自動補填します。準備金と承認枠はオンチェーンで確認でき、支払能力は透明です。", ko: "컨트랙트 잔액이 원리금 지급에 부족하면 트레저리가 자동 보충합니다. 준비금과 승인 한도는 온체인에서 확인 가능해 지급 능력이 투명합니다." },
  "mo.5p1": { zh: "自动补足兑付缺口", en: "Shortfalls topped up automatically", ja: "不足分を自動補填", ko: "부족분 자동 보충" },
  "mo.5p2": { zh: "储备与授权链上可查", en: "Reserves and allowance on-chain", ja: "準備金と承認枠はオンチェーン", ko: "준비금과 승인 한도 온체인 공개" },
  "mo.5p3": { zh: "兑付路径全程免税转账", en: "Settlement transfers are untaxed", ja: "決済経路は非課税送金", ko: "정산 경로는 무과세 전송" },

  // ---------- economy ----------
  "e.kicker": { zh: "ECONOMIC LAYER · 经济模型", en: "ECONOMIC LAYER", ja: "ECONOMIC LAYER · 経済モデル", ko: "ECONOMIC LAYER · 경제 모델" },
  "e.title1": { zh: "三档周期,", en: "Three terms, ", ja: "3 つの期間、", ko: "세 가지 기간, " },
  "e.title2": { zh: "一条复利曲线", en: "one compounding curve", ja: "一本の複利カーブ", ko: "하나의 복리 곡선" },
  "e.lead": {
    zh: "周期越长,日化越高。利息不领取时按日复利滚存,到期本金按当时价格兑付等值美金的代币。",
    en: "The longer the term, the higher the daily rate. Unclaimed interest compounds daily, and at maturity the principal settles in tokens worth its locked dollar value.",
    ja: "期間が長いほど日利は高くなります。未受取の利息は日次で複利計上され、満期には元本が固定ドル額相当のトークンで決済されます。",
    ko: "기간이 길수록 일이율이 높아집니다. 미수령 이자는 매일 복리로 쌓이고, 만기에는 원금이 고정된 달러 가치 상당의 토큰으로 정산됩니다.",
  },
  "e.term": { zh: "天锁仓", en: "day term", ja: "日ロック", ko: "일 락업" },
  "e.daily": { zh: "日化 · 按日复利", en: "daily · compounded", ja: "日利 · 日次複利", ko: "일이율 · 일일 복리" },
  "e.oracleTitle": { zh: "PRICE ORACLE · 报价护栏", en: "PRICE ORACLE", ja: "PRICE ORACLE · 報価ガードレール", ko: "PRICE ORACLE · 가격 가드레일" },
  "e.oracleLead": {
    zh: "金本位的核心是价格。结算价由预言机按稳健价源推送,并受三重链上护栏约束,避免任何一方通过瞬时拉抬或砸盘影响记账。",
    en: "Price is the heart of a gold standard. The settlement price is pushed by an oracle from robust sources and bounded by three on-chain guardrails, so no one can move the ledger with a pump or a dump.",
    ja: "ゴールドスタンダードの核心は価格です。決済価格は堅牢な価格源からオラクルが送信し、3 重のオンチェーン・ガードレールで制約されるため、瞬間的な急騰・急落で帳簿を動かすことはできません。",
    ko: "골드 스탠더드의 핵심은 가격입니다. 정산 가격은 견고한 가격원에서 오라클이 전송하고 3중 온체인 가드레일로 제한되므로, 순간적인 펌핑이나 덤핑으로 장부를 움직일 수 없습니다.",
  },
  "e.g1k": { zh: "偏离护栏", en: "Deviation guard", ja: "乖離ガード", ko: "이탈 가드" },
  "e.g1v": { zh: "推送价必须贴近链上现价", en: "Pushed price must track on-chain spot", ja: "送信価格はオンチェーン現在値に近接必須", ko: "전송 가격은 온체인 현재가에 근접해야 함" },
  "e.g2k": { zh: "单步限幅", en: "Step cap", ja: "ステップ上限", ko: "스텝 상한" },
  "e.g2v": { zh: "单次调价幅度受硬上限约束", en: "Each update is capped by a hard limit", ja: "1 回の変動幅にハード上限", ko: "1회 변동 폭에 하드 상한" },
  "e.g3k": { zh: "时效护栏", en: "Freshness guard", ja: "鮮度ガード", ko: "신선도 가드" },
  "e.g3v": { zh: "超时未更新自动冻结提取", en: "Stale price freezes withdrawals", ja: "更新切れで引出を自動凍結", ko: "만료 시 인출 자동 동결" },
  "e.g4k": { zh: "权限隔离", en: "Role isolation", ja: "権限分離", ko: "권한 분리" },
  "e.g4v": { zh: "报价角色仅能推价,无其他权限", en: "The oracle role can only push prices", ja: "オラクル権限は価格送信のみ", ko: "오라클 역할은 가격 전송만 가능" },

  // ---------- roadmap ----------
  "r.kicker": { zh: "ROADMAP · 航行路线", en: "ROADMAP", ja: "ROADMAP · 航路", ko: "ROADMAP · 항로" },
  "r.title1": { zh: "从协议部署到", en: "From protocol launch to ", ja: "プロトコル展開から", ko: "프로토콜 배포에서 " },
  "r.title2": { zh: "星际生态", en: "an interstellar ecosystem", ja: "星間エコシステムへ", ko: "인터스텔라 생태계로" },
  "r.lead": {
    zh: "以流动性深度为节奏推进 —— 底池达到目标规模、兑付能力经受验证之后,才开放银行。",
    en: "Progress is paced by liquidity depth — the bank opens only once the pool reaches its target size and settlement capacity has been proven.",
    ja: "流動性の深さに合わせて進めます。プールが目標規模に達し、支払能力が検証されてから銀行を開放します。",
    ko: "유동성 깊이에 맞춰 진행합니다. 풀이 목표 규모에 도달하고 지급 능력이 검증된 후에 뱅크를 개방합니다.",
  },
  "r.p1t": { zh: "协议部署", en: "Protocol Deployment", ja: "プロトコル展開", ko: "프로토콜 배포" },
  "r.p1d": { zh: "金本位银行合约上线 BSC 主网,报价预言机与国库授权同步就位。", en: "The gold-standard bank contract goes live on BSC mainnet, with the price oracle and treasury allowance in place.", ja: "ゴールドスタンダード銀行コントラクトを BSC メインネットに展開し、価格オラクルとトレジャリー承認を整備。", ko: "골드 스탠더드 뱅크 컨트랙트를 BSC 메인넷에 배포하고, 가격 오라클과 트레저리 승인을 함께 준비합니다." },
  "r.p2t": { zh: "流动性筑基", en: "Liquidity Foundation", ja: "流動性の構築", ko: "유동성 기반 구축" },
  "r.p2d": { zh: "底池扩容至目标规模,报价深度与兑付能力达到开放标准。", en: "The pool scales to its target size, bringing price depth and settlement capacity up to launch standard.", ja: "プールを目標規模まで拡大し、価格の厚みと支払能力を開放基準まで引き上げます。", ko: "풀을 목표 규모까지 확대하여 가격 깊이와 지급 능력을 개방 기준까지 끌어올립니다." },
  "r.p3t": { zh: "星际银行开放", en: "Stellar Bank Opens", ja: "ステラバンク開放", ko: "스텔라 뱅크 개방" },
  "r.p3d": { zh: "质押与复利体系全面开放,账户以美金计价,链上可随时核对。", en: "Staking and compounding open to all, with dollar-denominated accounts verifiable on-chain at any time.", ja: "ステーキングと複利機能を全面開放。ドル建てアカウントはいつでもオンチェーンで確認できます。", ko: "스테이킹과 복리 기능을 전면 개방하며, 달러 기준 계좌는 언제든 온체인에서 확인할 수 있습니다." },
  "r.p4t": { zh: "生态扩展", en: "Ecosystem Expansion", ja: "エコシステム拡張", ko: "생태계 확장" },
  "r.p4d": { zh: "围绕 AI 算力与数据资产扩展应用场景,推动代币在真实业务中沉淀。", en: "Use cases expand around AI compute and data assets, anchoring the token in real business flow.", ja: "AI コンピュートとデータ資産を軸に用途を拡大し、トークンを実業務に定着させます。", ko: "AI 컴퓨팅과 데이터 자산을 중심으로 활용처를 넓혀 토큰을 실제 비즈니스에 정착시킵니다." },

  // ---------- final cta ----------
  "c.title1": { zh: "注入流动性,", en: "Add liquidity, ", ja: "流動性を注ぎ、", ko: "유동성을 더하고, " },
  "c.title2": { zh: "共享宇宙红利", en: "share the cosmic dividend", ja: "宇宙の配当を分かち合う", ko: "우주의 배당을 나눕니다" },
  "c.lead": { zh: "连接钱包,选择周期,让时间与复利替你工作。", en: "Connect your wallet, pick a term, and let time and compounding do the work.", ja: "ウォレットを接続し、期間を選び、時間と複利に働いてもらいましょう。", ko: "지갑을 연결하고 기간을 선택해, 시간과 복리가 일하게 하세요." },
  "c.buy": { zh: "购买 SPACEAI", en: "Buy SPACEAI", ja: "SPACEAI を購入", ko: "SPACEAI 구매" },
  "c.contract": { zh: "合约", en: "Contract", ja: "コントラクト", ko: "컨트랙트" },

  // ---------- footer ----------
  "f.tagline": {
    zh: "AI × DeFi 星际价值共振。以金本位记账的链上银行,把不确定的币价波动,折算成一份可以看懂的美金合约。",
    en: "AI × DeFi interstellar value resonance. A gold-standard on-chain bank that turns unpredictable price swings into a dollar contract you can actually read.",
    ja: "AI × DeFi の星間バリューレゾナンス。ゴールドスタンダードで記帳するオンチェーンバンクが、不確実な価格変動を読み解けるドル建て契約に変えます。",
    ko: "AI × DeFi 인터스텔라 가치 공명. 골드 스탠더드로 기록하는 온체인 뱅크가 불확실한 시세 변동을 이해할 수 있는 달러 계약으로 바꿉니다.",
  },
  "f.protocol": { zh: "协议", en: "Protocol", ja: "プロトコル", ko: "프로토콜" },
  "f.onchain": { zh: "链上", en: "On-chain", ja: "オンチェーン", ko: "온체인" },
  "f.rights": { zh: "部署于 BNB Smart Chain", en: "Deployed on BNB Smart Chain", ja: "BNB Smart Chain 上で稼働", ko: "BNB Smart Chain 배포" },
  "f.risk": { zh: "数字资产价格波动剧烈,参与前请自行评估风险。本站不构成投资建议。", en: "Digital assets are highly volatile. Assess the risks yourself before participating. Nothing here is investment advice.", ja: "デジタル資産は価格変動が大きい資産です。参加前にご自身でリスクを評価してください。本サイトは投資助言ではありません。", ko: "디지털 자산은 가격 변동이 큽니다. 참여 전 스스로 위험을 평가하세요. 본 사이트는 투자 자문이 아닙니다." },

  // ---------- console ----------
  "a.kicker": { zh: "STELLAR BANK · 星际银行", en: "STELLAR BANK", ja: "STELLAR BANK · ステラバンク", ko: "STELLAR BANK · 스텔라 뱅크" },
  "a.title": { zh: "金本位质押控制台", en: "Gold-Standard Staking Console", ja: "ゴールドスタンダード・ステーキング", ko: "골드 스탠더드 스테이킹 콘솔" },
  "a.connectTitle": { zh: "连接钱包以进入", en: "Connect your wallet to enter", ja: "ウォレットを接続して開始", ko: "지갑을 연결해 시작" },
  "a.connectSub": { zh: "连接即登录,你的地址就是账户。所有仓位数据均从链上实时读取。", en: "Connecting is logging in — your address is the account. All position data is read live from chain.", ja: "接続がログインです。アドレスがアカウントとなり、ポジション情報はすべてチェーンから直接読み込まれます。", ko: "연결이 곧 로그인입니다. 주소가 계정이며 모든 포지션 데이터는 체인에서 실시간으로 읽어옵니다." },
  "a.tabStake": { zh: "质押", en: "Stake", ja: "ステーク", ko: "스테이킹" },
  "a.tabPos": { zh: "我的仓位", en: "Positions", ja: "ポジション", ko: "포지션" },
  "a.tabRef": { zh: "邀请", en: "Invite", ja: "招待", ko: "초대" },

  "a.refTitle": { zh: "我的邀请链接", en: "My invite link", ja: "招待リンク", ko: "내 초대 링크" },
  "a.refBody": {
    zh: "把链接发给伙伴,对方通过它首次质押即与你绑定。绑定关系写入链上,永久有效,之后不可更改。",
    en: "Share this link. When someone stakes for the first time through it, the two of you are bound on-chain — permanently, and it cannot be changed afterwards.",
    ja: "このリンクを共有してください。相手がこのリンク経由で初めてステークすると、オンチェーンで永続的に紐付けられ、後から変更はできません。",
    ko: "이 링크를 공유하세요. 상대가 이 링크로 처음 스테이킹하면 온체인에 영구적으로 연결되며, 이후에는 변경할 수 없습니다.",
  },
  "a.refCopy": { zh: "复制链接", en: "Copy link", ja: "リンクをコピー", ko: "링크 복사" },
  "a.refCopied": { zh: "已复制 ✓", en: "Copied ✓", ja: "コピーしました ✓", ko: "복사됨 ✓" },
  "a.refMine": { zh: "我的推荐人", en: "My referrer", ja: "私の紹介者", ko: "내 추천인" },
  "a.refNone": { zh: "未绑定", en: "Not bound", ja: "未設定", ko: "미설정" },
  "a.refInput": { zh: "推荐人地址(选填,仅首次质押时绑定)", en: "Referrer address (optional, bound on your first stake)", ja: "紹介者アドレス(任意・初回ステーク時に確定)", ko: "추천인 주소 (선택, 첫 스테이킹 시 확정)" },
  "a.refLocked": { zh: "推荐人(已锁定)", en: "Referrer (locked)", ja: "紹介者(確定済み)", ko: "추천인 (확정됨)" },
  "a.refOnchain": { zh: "已在链上绑定,永久有效", en: "Bound on-chain — permanent", ja: "オンチェーンで確定済み・永続", ko: "온체인 확정 — 영구" },
  "a.refPending": { zh: "首次质押时写入链上", en: "Written on-chain with your first stake", ja: "初回ステーク時にオンチェーンへ記録", ko: "첫 스테이킹 시 온체인에 기록" },
  "a.refBindNow": { zh: "立即绑定", en: "Bind now", ja: "今すぐ確定", ko: "지금 연결" },
  "a.refBinding": { zh: "绑定中…", en: "Binding…", ja: "確定中…", ko: "연결 중…" },
  "a.refBindTip": {
    zh: "点击立即上链绑定,或直接质押时自动完成(两者效果相同,绑定需支付少量 gas)。",
    en: "Bind on-chain now, or let your first stake do it automatically — same result; binding now costs a little gas.",
    ja: "今すぐオンチェーンで確定するか、初回ステーク時に自動で確定します(結果は同じ・今すぐの場合は少額のガス代が必要)。",
    ko: "지금 온체인에 연결하거나 첫 스테이킹 시 자동으로 처리됩니다(결과는 동일하며, 지금 연결하면 소액의 가스비가 듭니다).",
  },
  "a.refBound": { zh: "绑定成功,已写入链上。", en: "Bound — it is on-chain now.", ja: "確定しました。オンチェーンに記録済みです。", ko: "연결 완료 — 온체인에 기록되었습니다." },
  "a.refLevel": { zh: "我的等级", en: "My level", ja: "自分のレベル", ko: "내 등급" },
  "a.refTeam": { zh: "团队业绩", en: "Team volume", ja: "チーム実績", ko: "팀 실적" },
  "a.refSmall": { zh: "小区业绩", en: "Small area", ja: "小エリア実績", ko: "소구역 실적" },
  // level names (display only — the contract just stores V1..V5 as indexes)
  "lv.1": { zh: "星尘", en: "Stardust", ja: "スターダスト", ko: "스타더스트" },
  "lv.2": { zh: "拓荒者", en: "Pioneer", ja: "パイオニア", ko: "파이오니어" },
  "lv.3": { zh: "远征军", en: "Expedition", ja: "遠征軍", ko: "원정군" },
  "lv.4": { zh: "星域领主", en: "Warden", ja: "星域領主", ko: "성역 영주" },
  "lv.5": { zh: "创世者", en: "Genesis", ja: "創世者", ko: "창세자" },
  "lv.0": { zh: "未定级", en: "Unranked", ja: "ランク外", ko: "등급 없음" },

  "a.refDirects": { zh: "直推人数", en: "Direct referrals", ja: "直接紹介人数", ko: "직접 추천 인원" },
  "a.refDirectVol": { zh: "直推业绩", en: "Direct volume", ja: "直接紹介実績", ko: "직접 추천 실적" },
  "a.refMyStake": { zh: "我的质押", en: "My stake", ja: "自分のステーク", ko: "내 스테이킹" },
  "a.refConnect": { zh: "连接钱包后可查看你的专属邀请链接。", en: "Connect your wallet to see your personal invite link.", ja: "ウォレットを接続すると専用の招待リンクが表示されます。", ko: "지갑을 연결하면 전용 초대 링크가 표시됩니다." },
  "a.soonTitle": { zh: "星际银行即将开放", en: "Stellar Bank opens soon", ja: "ステラバンクは間もなく開放", ko: "스텔라 뱅크 곧 개방" },
  "a.soonBody": {
    zh: "协议合约已完成开发与全流程测试,将在底池流动性达到目标规模后开放存入 —— 确保开放首日即具备充足的兑付能力。",
    en: "The protocol is built and fully tested. Deposits open once pool liquidity reaches its target size, so settlement capacity is ample from day one.",
    ja: "プロトコルは開発と全工程のテストを完了しています。プールの流動性が目標規模に達した時点で入金を開放し、初日から十分な支払能力を確保します。",
    ko: "프로토콜은 개발과 전체 테스트를 마쳤습니다. 풀 유동성이 목표 규모에 도달하면 예치를 개방하여 첫날부터 충분한 지급 능력을 확보합니다.",
  },
  "a.status": { zh: "协议状态", en: "Protocol status", ja: "プロトコル状態", ko: "프로토콜 상태" },
  "a.statusV": { zh: "待开放", en: "Pending launch", ja: "開放準備中", ko: "개방 대기" },
  "a.network": { zh: "部署网络", en: "Network", ja: "ネットワーク", ko: "네트워크" },
  "a.cond": { zh: "开放条件", en: "Launch condition", ja: "開放条件", ko: "개방 조건" },
  "a.condV": { zh: "底池达到目标深度", en: "Pool reaches target depth", ja: "プールが目標の厚みに到達", ko: "풀이 목표 깊이에 도달" },
  "a.back": { zh: "返回首页", en: "Back to home", ja: "ホームへ戻る", ko: "홈으로" },

  "a.newPos": { zh: "NEW POSITION · 新建仓位", en: "NEW POSITION", ja: "NEW POSITION · 新規ポジション", ko: "NEW POSITION · 신규 포지션" },
  "a.pickTerm": { zh: "选择周期", en: "Choose a term", ja: "期間を選択", ko: "기간 선택" },
  "a.amount": { zh: "质押数量", en: "Amount", ja: "ステーク数量", ko: "스테이킹 수량" },
  "a.balance": { zh: "余额", en: "Balance", ja: "残高", ko: "잔액" },
  "a.max": { zh: "全部", en: "Max", ja: "全額", ko: "전액" },
  "a.lockedUsd": { zh: "锁定美金价值", en: "Locked USD value", ja: "固定されるドル価値", ko: "고정 USD 가치" },
  "a.dailyRate": { zh: "日化利率", en: "Daily rate", ja: "日利", ko: "일이율" },
  "a.unlock": { zh: "本金解锁", en: "Principal unlock", ja: "元本の解除", ko: "원금 해제" },
  "a.unlockV": { zh: "天后一次性", en: "days, single payout", ja: "日後に一括", ko: "일 후 일괄" },
  "a.approve": { zh: "授权", en: "Approve", ja: "承認", ko: "승인" },
  "a.confirmStake": { zh: "确认质押", en: "Confirm stake", ja: "ステークを確定", ko: "스테이킹 확인" },
  "a.paused": { zh: "协议当前暂停存入,已有仓位不受影响。", en: "Deposits are paused; existing positions are unaffected.", ja: "現在入金は停止中です。既存ポジションに影響はありません。", ko: "현재 예치가 중지되었습니다. 기존 포지션에는 영향이 없습니다." },
  "a.gsTitle": { zh: "GOLD STANDARD · 金本位说明", en: "GOLD STANDARD", ja: "GOLD STANDARD · 説明", ko: "GOLD STANDARD · 안내" },
  "a.gsBody": {
    zh: "存入时按当前报价把数量折算成美金并锁定该美金数。此后无论币价如何变动,你的本金与利息都以这个美金数为准 —— 币价下跌时兑付更多代币,上涨时兑付更少代币。",
    en: "At deposit your amount is converted to dollars at the current quote and that figure is locked. From then on principal and interest follow the dollar number — more tokens paid out if price falls, fewer if it rises.",
    ja: "入金時に現在の気配値で数量をドルに換算し、その金額を固定します。以後、元本と利息はこのドル額に従い、価格が下がればより多くのトークン、上がればより少ないトークンで支払われます。",
    ko: "예치 시 현재 시세로 수량을 달러로 환산해 그 금액을 고정합니다. 이후 원금과 이자는 이 달러 금액을 따르며, 시세가 내리면 더 많은 토큰을, 오르면 더 적은 토큰을 지급합니다.",
  },
  "a.curQuote": { zh: "当前报价", en: "Current quote", ja: "現在の気配値", ko: "현재 시세" },
  "a.notes": { zh: "NOTES · 参与须知", en: "NOTES", ja: "NOTES · ご参加にあたって", ko: "NOTES · 참여 안내" },
  "a.n1": { zh: "利息按日复利,不领取则持续滚存到账户价值中。", en: "Interest compounds daily and keeps accruing into your account value if unclaimed.", ja: "利息は日次で複利計上され、未受取ならアカウント価値に積み上がり続けます。", ko: "이자는 매일 복리로 계산되며, 수령하지 않으면 계좌 가치에 계속 쌓입니다." },
  "a.n2": { zh: "利息随时可领,支持全额或部分领取,剩余部分继续复利。", en: "Interest can be claimed any time, in full or in part; the rest keeps compounding.", ja: "利息はいつでも全額または一部を受け取れ、残りは複利を継続します。", ko: "이자는 언제든 전액 또는 일부 수령이 가능하며, 나머지는 계속 복리됩니다." },
  "a.n3": { zh: "本金整期锁定,到期后一次性解锁,可随时赎回。", en: "Principal stays locked for the term, then unlocks in one payment you can redeem any time.", ja: "元本は期間中ロックされ、満期後に一括で解除されいつでも償還できます。", ko: "원금은 기간 동안 락업되며 만기 후 일괄 해제되어 언제든 상환할 수 있습니다." },

  "a.noPos": { zh: "还没有仓位", en: "No positions yet", ja: "ポジションはまだありません", ko: "아직 포지션이 없습니다" },
  "a.noPosSub": { zh: "在「质押」页建立你的第一个金本位仓位。", en: "Open your first gold-standard position from the Stake tab.", ja: "「ステーク」タブから最初のポジションを作成しましょう。", ko: "'스테이킹' 탭에서 첫 포지션을 만들어 보세요." },
  "a.posTerm": { zh: "天仓位", en: "-day position", ja: "日ポジション", ko: "일 포지션" },
  "a.stLive": { zh: "计息中", en: "Accruing", ja: "利息計上中", ko: "이자 적립 중" },
  "a.stMature": { zh: "已到期", en: "Matured", ja: "満期", ko: "만기" },
  "a.stRedeemed": { zh: "已赎回", en: "Redeemed", ja: "償還済み", ko: "상환 완료" },
  "a.untilUnlock": { zh: "距解锁", en: "Unlocks in", ja: "解除まで", ko: "해제까지" },
  "a.canRedeem": { zh: "本金可赎回", en: "Principal redeemable", ja: "元本償還可能", ko: "원금 상환 가능" },
  "a.mPrincipal": { zh: "本金(锁定美金)", en: "Principal (locked USD)", ja: "元本(固定ドル)", ko: "원금 (고정 USD)" },
  "a.mInterest": { zh: "可领利息", en: "Claimable interest", ja: "受取可能利息", ko: "수령 가능 이자" },
  "a.mTokens": { zh: "≈ 可领代币", en: "≈ in tokens", ja: "≈ 受取トークン", ko: "≈ 수령 토큰" },
  "a.claimAll": { zh: "全部领取", en: "Claim all", ja: "全額受取", ko: "전액 수령" },
  "a.partialPh": { zh: "部分金额 $", en: "Partial amount $", ja: "一部金額 $", ko: "부분 금액 $" },
  "a.claimSome": { zh: "领取指定金额", en: "Claim amount", ja: "指定額を受取", ko: "지정 금액 수령" },
  "a.redeem": { zh: "赎回本金", en: "Redeem principal", ja: "元本を償還", ko: "원금 상환" },
  "a.loading": { zh: "载入中…", en: "Loading…", ja: "読み込み中…", ko: "불러오는 중…" },

  // errors / toasts
  "a.okApprove": { zh: "授权已提交,确认后即可质押。", en: "Approval submitted — you can stake once it confirms.", ja: "承認を送信しました。確定後にステークできます。", ko: "승인을 전송했습니다. 확정 후 스테이킹할 수 있습니다." },
  "a.okStake": { zh: "质押已提交,等待链上确认。", en: "Stake submitted, waiting for confirmation.", ja: "ステークを送信しました。確定をお待ちください。", ko: "스테이킹을 전송했습니다. 확정을 기다리는 중입니다." },
  "a.okClaim": { zh: "领取已提交。", en: "Claim submitted.", ja: "受取を送信しました。", ko: "수령을 전송했습니다." },
  "a.okRedeem": { zh: "赎回已提交。", en: "Redemption submitted.", ja: "償還を送信しました。", ko: "상환을 전송했습니다." },
  "a.limits": { zh: "参与限额", en: "Limits", ja: "参加限度", ko: "참여 한도" },
  "a.limitRange": { zh: "单个地址 $100 起投,累计上限 $10,000", en: "$100 minimum, $10,000 total per address", ja: "最低 $100・1アドレス合計 $10,000 まで", ko: "최소 $100, 주소당 합계 $10,000" },
  "a.remaining": { zh: "剩余可投额度", en: "Remaining capacity", ja: "残り枠", ko: "남은 한도" },
  "a.errBelowMin": { zh: "低于起投金额 $100。", en: "Below the $100 minimum.", ja: "最低額 $100 を下回っています。", ko: "최소 금액 $100 미만입니다." },
  "a.errOverCap": { zh: "超出该地址的累计上限,请减少数量。", en: "Exceeds this address's total cap — reduce the amount.", ja: "このアドレスの合計上限を超えています。数量を減らしてください。", ko: "이 주소의 합계 한도를 초과했습니다. 수량을 줄이세요." },
  "a.capFull": { zh: "已达上限,赎回到期本金后可再次质押。", en: "Cap reached — redeem matured principal to free capacity.", ja: "上限に達しました。満期元本を償還すると枠が戻ります。", ko: "한도에 도달했습니다. 만기 원금을 상환하면 한도가 복구됩니다." },
  "a.errAmount": { zh: "请输入质押数量。", en: "Enter an amount to stake.", ja: "ステーク数量を入力してください。", ko: "스테이킹 수량을 입력하세요." },
  "a.errBalance": { zh: "余额不足。", en: "Insufficient balance.", ja: "残高が不足しています。", ko: "잔액이 부족합니다." },
  "a.errCancel": { zh: "你在钱包中取消了操作。", en: "You cancelled the transaction in your wallet.", ja: "ウォレットで操作をキャンセルしました。", ko: "지갑에서 작업을 취소했습니다." },
  "a.errGas": { zh: "BNB 余额不足以支付 gas。", en: "Not enough BNB for gas.", ja: "ガス代の BNB が不足しています。", ko: "가스비용 BNB가 부족합니다." },
  "a.errStale": { zh: "报价已过期,请稍后再试。", en: "The price feed is stale — please retry shortly.", ja: "気配値が失効しています。しばらくして再試行してください。", ko: "시세가 만료되었습니다. 잠시 후 다시 시도하세요." },
  "a.errLocked": { zh: "本金尚未到期,暂不可赎回。", en: "Principal has not matured yet.", ja: "元本はまだ満期を迎えていません。", ko: "원금이 아직 만기되지 않았습니다." },
  "a.errPaused": { zh: "协议当前暂停存入。", en: "Deposits are currently paused.", ja: "現在入金は停止中です。", ko: "현재 예치가 중지되었습니다." },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
}
const I18nContext = createContext<Ctx>({ lang: "zh", setLang: () => {}, t: (k) => k });

function detect(): Lang {
  if (typeof window === "undefined") return "zh";
  const saved = localStorage.getItem("spaceai_lang") as Lang | null;
  if (saved && LANGS.some((l) => l.code === saved)) return saved;
  const n = navigator.language.toLowerCase();
  if (n.startsWith("ja")) return "ja";
  if (n.startsWith("ko")) return "ko";
  if (n.startsWith("zh")) return "zh";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detect());

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("spaceai_lang", l); } catch { /* private mode */ }
  };

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (k) => D[k]?.[lang] ?? D[k]?.en ?? k }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => useContext(I18nContext);
