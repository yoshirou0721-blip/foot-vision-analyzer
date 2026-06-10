import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import styles from "./result.module.css";
import { scanFiles, type Combined } from "@/lib/scan-store";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "YOSHIRO AI — 詳細結果" }] }),
  component: ResultScreen,
});

const clampPct = (n: number) => Math.max(0, Math.min(100, n));
const trackLeft = (pct: number, trackLeft = 82, trackWidth = 273) =>
  trackLeft + (clampPct(pct) / 100) * (trackWidth - 22.5);

function ResultScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState<Combined | null>(null);

  useEffect(() => {
    const r = scanFiles.getResult();
    if (!r) {
      navigate({ to: "/" });
      return;
    }
    setData(r);
  }, [navigate]);

  if (!data) return null;

  const front = data.front;
  const side = data.side;
  const foot = data.foot;

  const postureScores = [front?.score, side?.score].filter(
    (n): n is number => typeof n === "number",
  );
  const postureScore = postureScores.length
    ? Math.round(postureScores.reduce((a, b) => a + b, 0) / postureScores.length)
    : 0;
  const posturePct = Math.max(4, Math.min(100, postureScore));

  const footAge = foot?.foot_age ?? 0;
  const footAgePct = Math.max(4, Math.min(100, 100 - footAge));

  // Front row knob positions (5 sliders)
  const frontHeadPct = front ? clampPct(front.gravity_rate) : 50;
  const frontShoulderPct = 50;
  const frontWaistPct = front ? clampPct(front.o_rate) : 50;
  const frontKneePct = front ? clampPct((front.o_rate + front.x_rate) / 2) : 50;
  const frontLegPct = front ? clampPct(front.x_rate) : 50;

  // Side row knob positions (3 sliders)
  const sideNeckPct = 50;
  const sidePelvisPct = 50;
  const sideKneePct = 50;

  // Foot values
  const halluxR = foot?.hallux_right ?? 0;
  const halluxL = foot?.hallux_left ?? 0;
  const tailorR = foot?.tailor_right ?? 0;
  const tailorL = foot?.tailor_left ?? 0;
  const splayR = foot?.splay_right ?? 0;
  const splayL = foot?.splay_left ?? 0;

  const articles = foot?.articles ?? [];
  const articleRowClasses = [styles.row3, styles.row2, styles.row4, styles.row5, styles.row6];
  const articleInnerClasses = [styles.wrapper, styles.container, styles.frame, styles.frameDiv, styles.wrapper2];
  const defaultArticles = [
    "外反母趾の原因とは？",
    "スウェイバックの原因と対策",
    "靴の正しい選び方",
    "姿勢を整える小股歩きとは？",
    "内反小趾はどうすればいい？",
  ];
  const articleList = articles.length
    ? articles.slice(0, 5).map((a) => ({ title: a.title, url: a.url }))
    : defaultArticles.map((title) => ({ title, url: "#" }));

  return (
    <div style={{ background: "#0f1114", minHeight: "100vh", padding: "16px 0" }}>
      <div className={styles.result}>
        <div className={styles.neonBackground} />
        <div className={styles.div}>詳細結果</div>

        {/* ===== Front body sliders (5 rows) — center labels are STATIC Figma ===== */}
        <div className={styles.div4}>{front?.judge ?? "正常"}</div>
        <div className={styles.div5}>傾き</div>
        <div className={styles.div6}>{front ? `${Math.round(front.gravity_rate)}°` : "0°"}</div>
        <div className={styles.div7}>{front ? `${Math.round(front.gravity_rate)}%` : "0%"}</div>
        <div className={styles.div8}>ズレ</div>
        <div className={styles.div9}>傾き</div>
        <div className={styles.div10}>{front ? `${Math.round(front.o_rate)}°` : "0°"}</div>
        <div className={styles.div11}>{front ? `${Math.round(front.o_rate)}%` : "0%"}</div>
        <div className={styles.div12}>傾き</div>
        <div className={styles.div13}>{front ? `${Math.round(front.x_rate)}°` : "0°"}</div>
        <div className={styles.div14}>{front ? `${Math.round(front.x_rate)}%` : "0%"}</div>
        <div className={styles.div15}>ズレ</div>
        <div className={styles.div16}>傾き</div>
        <div className={styles.div17}>0°</div>
        <div className={styles.div18}>0%</div>
        <div className={styles.div19}>ズレ</div>
        <div className={styles.div20}>ズレ</div>

        <div className={styles.slider} />
        <div className={styles.slider2} />

        {/* ===== Posture score battery ===== */}
        <div className={styles.battery}>
          <div className={styles.batteryBaseIcon} />
          <div
            className={styles.batteryChargeIcon}
            style={{ width: `calc(${posturePct}% - 8px)` }}
          />
          <div className={styles.neonEffectIcon} />
          <div className={styles.div21}>姿勢スコア</div>
        </div>
        <div className={styles.div22}>
          <b className={styles.b}>{postureScore}</b>
          <span className={styles.span}>点</span>
        </div>

        {/* ===== Foot age battery ===== */}
        <div className={styles.batteryParent}>
          <div className={styles.battery2}>
            <div className={styles.batteryBaseIcon2} />
            <div
              className={styles.batteryChargeIcon2}
              style={{ width: `calc(${footAgePct}% - 8px)` }}
            />
            <div className={styles.neonEffectIcon2} />
            <div className={styles.div23}>足指年齢</div>
          </div>
          <div className={styles.groupChild} />
          <div className={styles.div24}>合格ライン</div>
          <div className={styles.groupItem} />
          <div className={styles.div25}>100歳</div>
          <div className={styles.div26}>
            <b className={styles.b}>{footAge}</b>
            <span className={styles.span}>歳</span>
          </div>
        </div>

        {/* ===== Back / settings buttons ===== */}
        <button
          className={styles.button}
          onClick={() => navigate({ to: "/" })}
          aria-label="戻る"
        >
          <div className={styles.buttonChild} />
          <div className={styles.buttonItem} />
          <div className={styles.buttonInner} />
          <div className={styles.div27}>‹</div>
        </button>

        <button className={styles.button2} aria-label="設定">
          <div className={styles.buttonChild} />
          <div className={styles.buttonItem} />
          <div className={styles.buttonInner} />
          <div className={styles.div29}>⚙</div>
        </button>

        {/* ===== Articles ===== */}
        <div className={styles.modeDescriptionWrapper}>
          <div className={styles.modeDescription}>
            <div className={styles.modeParent}>
              <div className={styles.mode}>おすすめ記事</div>
            </div>
            {articleList.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target={a.url === "#" ? undefined : "_blank"}
                rel="noreferrer"
                className={articleRowClasses[i] ?? styles.row3}
                style={{ textDecoration: "none" }}
              >
                <div className={articleInnerClasses[i] ?? styles.wrapper}>
                  <div className={styles.div32}>{a.title}</div>
                </div>
                <div className={styles.rightArrow}>
                  <div className={styles.div33}>›</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ===== Front body image + markers ===== */}
        <div className={styles.parent}>
          {data.previews.front ? (
            <img className={styles.icon} src={data.previews.front} alt="正面" />
          ) : (
            <div className={styles.icon} style={{ background: "rgba(255,255,255,0.04)" }} />
          )}
          <div className={styles.gradientWrapper}>
            <div className={styles.gradient}>
              <div className={styles.gradientChild} />
              <div className={styles.gradientItem} />
              <div className={styles.div42}>右</div>
            </div>
          </div>
          <div className={styles.groupInner} />
          <div className={styles.div43}>左</div>
        </div>

        {/* Left vertical tabs (front) */}
        <div className={styles.resultChild} />
        <div className={styles.wrapper3}><div className={styles.div44}>頭</div></div>
        <div className={styles.resultInner} />
        <div className={styles.wrapper4}><div className={styles.div44}>肩</div></div>
        <div className={styles.rectangleDiv} />
        <div className={styles.wrapper5}><div className={styles.div44}>腰</div></div>
        <div className={styles.resultChild2} />
        <div className={styles.wrapper6}><div className={styles.div44}>膝</div></div>
        <div className={styles.lineDiv} />

        <div className={styles.neonBackground2} />

        {/* ===== Side body labels (3 rows) — center labels STATIC ===== */}
        <div className={styles.div48}>{side?.judge ?? "正常"}</div>
        <div className={styles.div49}>傾き</div>
        <div className={styles.div50}>0°</div>
        <div className={styles.div51}>傾き</div>
        <div className={styles.div52}>{side?.pelvis_type ?? "後傾"}</div>
        <div className={styles.div53}>{side?.posture_type ?? "後弯"}</div>
        <div className={styles.div54}>{side?.knee_type ?? "反張膝"}</div>
        <div className={styles.div55}>屈曲</div>
        <div className={styles.div56}>前傾</div>
        <div className={styles.div57}>ストレートネック</div>
        <div className={styles.div58}>0°</div>
        <div className={styles.div59}>傾き</div>
        <div className={styles.div60}>0°</div>

        <div className={styles.resultChild3} />
        <div className={styles.wrapper7}><div className={styles.div61}>骨盤</div></div>
        <div className={styles.resultChild4} />
        <div className={styles.wrapper8}><div className={styles.div61}>首</div></div>
        <div className={styles.resultChild5} />
        <div className={styles.wrapper9}><div className={styles.div44}>膝</div></div>
        <div className={styles.resultChild6} />

        {/* Front sliders 5 tracks + 5 knobs */}
        <div className={styles.resultChild7} />
        <div className={styles.groupDiv}>
          <div className={styles.wrapper10}><div className={styles.div64}>{Math.round(frontWaistPct / 10)}</div></div>
        </div>
        <div className={styles.rectangleParent}>
          <div className={styles.groupChild2} />
          <div className={styles.frameWrapper} style={{ left: trackLeft(frontKneePct, 0, 273) }}>
            <div className={styles.wrapper11}><div className={styles.div64}>{Math.round(frontKneePct / 10)}</div></div>
          </div>
        </div>
        <div className={styles.rectangleGroup}>
          <div className={styles.groupChild2} />
          <div className={styles.frameWrapper} style={{ left: trackLeft(frontLegPct, 0, 273) }}>
            <div className={styles.wrapper11}><div className={styles.div64}>{Math.round(frontLegPct / 10)}</div></div>
          </div>
        </div>

        <div className={styles.slider3} />
        <div className={styles.slider4} />
        <div className={styles.slider5} />
        <div className={styles.slider6} />
        <div className={styles.slider7} />

        <div className={styles.wrapper13} style={{ left: trackLeft(frontHeadPct) }}>
          <div className={styles.div64}>{Math.round(frontHeadPct / 10)}</div>
        </div>
        <div className={styles.wrapper14} style={{ left: trackLeft(frontShoulderPct) }}>
          <div className={styles.div64}>{Math.round(frontShoulderPct / 10)}</div>
        </div>
        <div className={styles.wrapper15} style={{ left: trackLeft(frontWaistPct) }}>
          <div className={styles.div64}>{Math.round(frontWaistPct / 10)}</div>
        </div>
        <div className={styles.wrapper16} style={{ left: trackLeft(frontKneePct) }}>
          <div className={styles.div64}>{Math.round(frontKneePct / 10)}</div>
        </div>
        <div className={styles.wrapper17} style={{ left: trackLeft(frontLegPct) }}>
          <div className={styles.div64}>{Math.round(frontLegPct / 10)}</div>
        </div>

        {/* Side body sliders */}
        <div className={styles.resultChild8} />
        <div className={styles.resultChild9} />
        <div className={styles.resultChild10} />
        <div className={styles.wrapper18} style={{ left: trackLeft(sideNeckPct, 87, 273) }}>
          <div className={styles.div72}>{Math.round(sideNeckPct / 4)}</div>
        </div>
        <div className={styles.wrapper19} style={{ left: trackLeft(sidePelvisPct, 87, 273) }}>
          <div className={styles.div72}>{Math.round(sidePelvisPct / 4)}</div>
        </div>
        <div className={styles.wrapper20} style={{ left: trackLeft(sideKneePct, 87, 273) }}>
          <div className={styles.div74}>{Math.round(sideKneePct / 4)}</div>
        </div>

        {/* ===== Foot photo ===== */}
        {data.previews.foot ? (
          <img className={styles.p11002571Icon} src={data.previews.foot} alt="足指" />
        ) : (
          <div className={styles.p11002571Icon} style={{ background: "rgba(255,255,255,0.04)" }} />
        )}

        {/* ===== Foot metric anchors ===== */}
        <div className={styles.div75}>正常</div>
        <div className={styles.div76}>重度</div>
        <div className={styles.div77}>正常</div>
        <div className={styles.div78}>重度</div>
        <div className={styles.div79}>正常</div>
        <div className={styles.div80}>重度</div>

        <div className={styles.div81}>右</div>
        <div className={styles.div82}>左</div>
        <div className={styles.resultChild11} />
        <div className={styles.wrapper21}><div className={styles.div83}>外反母趾</div></div>
        <div className={styles.resultChild12} />
        <div className={styles.wrapper22} style={{ left: trackLeft(halluxR / 60 * 100, 86, 273) }}>
          <div className={styles.div84}>{Math.round(halluxR)}°</div>
        </div>
        <div className={styles.resultChild13} />

        <div className={styles.div85}>右</div>
        <div className={styles.div86}>左</div>
        <div className={styles.resultChild14} />
        <div className={styles.wrapper23}><div className={styles.div83}>内反小趾</div></div>
        <div className={styles.resultChild15} />
        <div className={styles.resultChild16} />

        <div className={styles.div88}>右</div>
        <div className={styles.div89}>左</div>
        <div className={styles.resultChild17} />
        <div className={styles.wrapper24}><div className={styles.div83}>開帳足</div></div>
        <div className={styles.resultChild18} />
        <div className={styles.resultChild19} />

        {/* Hallux left knob */}
        <div className={styles.wrapper25} style={{ left: trackLeft(halluxL / 60 * 100, 86, 273) }}>
          <div className={styles.div84}>{Math.round(halluxL)}°</div>
        </div>
        {/* Tailor right + left */}
        <div className={styles.wrapper26} style={{ left: trackLeft(tailorR / 60 * 100, 86, 273) }}>
          <div className={styles.div84}>{Math.round(tailorR)}°</div>
        </div>
        <div className={styles.wrapper27} style={{ left: trackLeft(tailorL / 60 * 100, 86, 273) }}>
          <div className={styles.div84}>{Math.round(tailorL)}°</div>
        </div>
        {/* Splay right + left */}
        <div className={styles.wrapper28} style={{ left: trackLeft(splayR, 86, 273) }}>
          <div className={styles.div109}>{Math.round(splayR)}</div>
        </div>
        <div className={styles.wrapper29} style={{ left: trackLeft(splayL, 86, 273) }}>
          <div className={styles.div109}>{Math.round(splayL)}</div>
        </div>

        {/* CTA */}
        <button className={styles.lock} onClick={() => navigate({ to: "/" })}>
          <div className={styles.div91}>
            <div className={styles.div92}>もう一度分析する</div>
          </div>
        </button>

        {/* ===== Score reference card ===== */}
        <div className={styles.resultInner2}>
          <div className={styles.frameChild} />
        </div>
        <div className={styles.div93}>姿勢スコア基準表</div>
        <div className={styles.background}>
          <div className={styles.backgroundChild} />
          <div className={styles.group}>
            <div className={styles.mode}>~59</div>
            <div className={styles.div95}>深刻な歪み</div>
          </div>
        </div>
        <div className={styles.resultChild20} />
        <div className={styles.resultChild21} />
        <div className={styles.resultChild22} />
        <div className={styles.resultChild23} />
        <div className={styles.parent2}>
          <div className={styles.mode}>~79</div>
          <div className={styles.div95}>惜しい</div>
        </div>
        <div className={styles.parent3}>
          <div className={styles.mode}>~89</div>
          <div className={styles.div95}>良い姿勢</div>
        </div>
        <div className={styles.parent4}>
          <div className={styles.mode}>~100</div>
          <div className={styles.div95}>美姿勢</div>
        </div>
        <div className={styles.parent5}>
          <div className={styles.mode}>~69</div>
          <div className={styles.div95}>要ケア</div>
        </div>

        {/* ===== Comment cards ===== */}
        <div className={styles.resultChild24} />
        <div className={styles.mode2}>姿勢コメント</div>
        <div className={styles.mode3}>{side?.comment ?? "首・骨盤・膝は理想的な範囲です"}</div>

        <div className={styles.resultChild25} />
        <div className={styles.mode4}>足指コメント</div>
        <div className={styles.mode5}>{foot?.comment ?? ""}</div>

        <div className={styles.resultChild26} />
        <div className={styles.mode6}>姿勢コメント</div>
        <div className={styles.mode7}>{front?.comment ?? "首・骨盤・膝は理想的な範囲です"}</div>

        {/* ===== Side body image + markers ===== */}
        <div className={styles.parent6}>
          {data.previews.side ? (
            <img className={styles.icon} src={data.previews.side} alt="真横" />
          ) : (
            <div className={styles.icon} style={{ background: "rgba(255,255,255,0.04)" }} />
          )}
          <div className={styles.groupChild4} />
          <div className={styles.groupInner} />
          <div className={styles.div104}>後</div>
          <div className={styles.div43}>前</div>
        </div>
      </div>
    </div>
  );
}
