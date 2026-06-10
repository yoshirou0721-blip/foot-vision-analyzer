import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import styles from "./result.module.css";
import { scanFiles, type Combined } from "@/lib/scan-store";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "YOSHIRO AI — 詳細結果" }] }),
  component: Result,
});

function Result() {
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

  const onLeftArrowIConClick = useCallback(() => {
    // Add your code here
  }, []);

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

  const footAge = foot?.foot_age ?? 0;

  const articles = foot?.articles ?? [];
  const defaultTitles = [
    "外反母趾の原因とは？",
    "スウェイバックの原因と対策",
    "靴の正しい選び方",
    "姿勢を整える小股歩きとは？",
    "内反小趾はどうすればいい？",
  ];
  const articleItems = (
    articles.length
      ? articles.slice(0, 5).map((a) => ({ title: a.title, url: a.url }))
      : defaultTitles.map((t) => ({ title: t, url: "#" }))
  );
  while (articleItems.length < 5) {
    articleItems.push({ title: defaultTitles[articleItems.length], url: "#" });
  }

  return (
    <div style={{ background: "#0f1114", minHeight: "100vh" }}>
      <div className={styles.result}>
        <div className={styles.neonBackground} />
        <div className={styles.div}>詳細結果</div>
        <div className={styles.div2}>
          <img className={styles.child} alt="" />
          <div className={styles.div3}>{front ? `${Math.round(front.gravity_rate)}%` : "50%"}</div>
        </div>
        <div className={styles.div4}>正常</div>
        <div className={styles.div5}>傾き</div>
        <div className={styles.div6}>{front ? `${Math.round(front.gravity_rate)}°` : "0°"}</div>
        <div className={styles.div7}>{front ? `${Math.round(front.gravity_rate)}％` : "0％"}</div>
        <div className={styles.div8}>ズレ</div>
        <div className={styles.div9}>傾き</div>
        <div className={styles.div10}>0°</div>
        <div className={styles.div11}>0％</div>
        <div className={styles.div12}>傾き</div>
        <div className={styles.div13}>{front ? `${Math.round(front.o_rate)}°` : "0°"}</div>
        <div className={styles.div14}>{front ? `${Math.round(front.o_rate)}％` : "0％"}</div>
        <div className={styles.div15}>ズレ</div>
        <div className={styles.div16}>傾き</div>
        <div className={styles.div17}>{front ? `${Math.round(front.x_rate)}°` : "0°"}</div>
        <div className={styles.div18}>{front ? `${Math.round(front.x_rate)}％` : "0％"}</div>
        <div className={styles.div19}>ズレ</div>
        <div className={styles.div20}>ズレ</div>
        <div className={styles.slider} />
        <div className={styles.slider2} />
        <div className={styles.battery}>
          <img className={styles.batteryBaseIcon} alt="" />
          <img className={styles.batteryChargeIcon} alt="" />
          <img className={styles.neonEffectIcon} alt="" />
          <div className={styles.div21}>姿勢スコア</div>
        </div>
        <div className={styles.div22}>
          <b className={styles.b}>{postureScore}</b>
          <span className={styles.span}>点</span>
        </div>
        <div className={styles.batteryParent}>
          <div className={styles.battery2}>
            <img className={styles.batteryBaseIcon2} alt="" />
            <img className={styles.batteryChargeIcon2} alt="" />
            <img className={styles.neonEffectIcon2} alt="" />
            <div className={styles.div23}>足指年齢</div>
          </div>
          <img className={styles.groupChild} alt="" />
          <div className={styles.div24}>合格ライン</div>
          <img className={styles.groupItem} alt="" />
          <div className={styles.div25}>100点</div>
          <div className={styles.div26}>
            <b className={styles.b}>{footAge}</b>
            <span className={styles.span}>歳</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.button}
          onClick={() => navigate({ to: "/" })}
          aria-label="戻る"
        >
          <div className={styles.buttonChild} />
          <div className={styles.buttonItem} />
          <div className={styles.buttonInner} />
          <div className={styles.div27}>‹</div>
        </button>
        <div className={styles.statusbarIphone1313Pro}>
          <div className={styles.rightSide}>
            <img className={styles.batteryIcon} alt="" />
            <img className={styles.wifiIcon} alt="" />
            <img className={styles.mobileSignalIcon} alt="" />
          </div>
          <div className={styles.leftSide}>
            <div className={styles.statusbarTime}>
              <div className={styles.div28}>9:41</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={styles.button2}
          aria-label="設定"
        >
          <div className={styles.buttonChild} />
          <div className={styles.buttonItem} />
          <div className={styles.buttonInner} />
          <div className={styles.div29}>⚙</div>
        </button>
        <div className={styles.modeDescriptionWrapper}>
          <div className={styles.modeDescription}>
            <div className={styles.modeParent}>
              <div className={styles.mode}>おすすめ記事</div>
              <div className={styles.div30}>›</div>
              <div className={styles.leftArrowIcon} onClick={onLeftArrowIConClick}>
                <div className={styles.leftArrowIconChild} />
                <div className={styles.div31}>✎</div>
                <div className={styles.listBullet}>
                  <div className={styles.listBullet2}>‹</div>
                </div>
              </div>
            </div>
            {[
              { row: styles.row3, inner: styles.wrapper },
              { row: styles.row2, inner: styles.container },
              { row: styles.row4, inner: styles.frame },
              { row: styles.row5, inner: styles.frameDiv },
              { row: styles.row6, inner: styles.wrapper2 },
            ].map((cls, i) => {
              const a = articleItems[i];
              return (
                <a
                  key={i}
                  href={a.url}
                  target={a.url === "#" ? undefined : "_blank"}
                  rel="noreferrer"
                  className={cls.row}
                  style={{ textDecoration: "none" }}
                >
                  <div className={cls.inner}>
                    <div className={styles.div32}>{a.title}</div>
                  </div>
                  <div className={styles.rightArrow}>
                    <div className={styles.div33}>›</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        <div className={styles.homeindicator}>
          <div className={styles.homeIndicator} />
        </div>
        <div className={styles.parent}>
          {data.previews.front ? (
            <img className={styles.icon} src={data.previews.front} alt="正面" />
          ) : (
            <img className={styles.icon} alt="" />
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
        <div className={styles.resultChild} />
        <div className={styles.resultChild} />
        <div className={styles.wrapper3}>
          <div className={styles.div44}>頭</div>
        </div>
        <div className={styles.resultInner} />
        <div className={styles.wrapper4}>
          <div className={styles.div44}>肩</div>
        </div>
        <div className={styles.rectangleDiv} />
        <div className={styles.wrapper5}>
          <div className={styles.div44}>腰</div>
        </div>
        <div className={styles.resultChild2} />
        <div className={styles.wrapper6}>
          <div className={styles.div44}>膝</div>
        </div>
        <div className={styles.lineDiv} />
        <div className={styles.neonBackground2} />
        <div className={styles.div48}>正常</div>
        <div className={styles.div49}>傾き</div>
        <div className={styles.div50}>0°</div>
        <div className={styles.div51}>傾き</div>
        <div className={styles.div52}>後傾</div>
        <div className={styles.div53}>後弯</div>
        <div className={styles.div54}>反張膝</div>
        <div className={styles.div55}>屈曲</div>
        <div className={styles.div56}>前傾</div>
        <div className={styles.div57}>ストレートネック</div>
        <div className={styles.div58}>0°</div>
        <div className={styles.div59}>傾き</div>
        <div className={styles.div60}>0°</div>
        <div className={styles.resultChild3} />
        <div className={styles.wrapper7}>
          <div className={styles.div61}>骨盤</div>
        </div>
        <div className={styles.resultChild4} />
        <div className={styles.wrapper8}>
          <div className={styles.div61}>首</div>
        </div>
        <div className={styles.resultChild5} />
        <div className={styles.wrapper9}>
          <div className={styles.div44}>膝</div>
        </div>
        <div className={styles.resultChild6} />
        <div className={styles.resultChild7} />
        <div className={styles.groupDiv}>
          <div className={styles.wrapper10}>
            <div className={styles.div64}>9</div>
          </div>
        </div>
        <div className={styles.rectangleParent}>
          <div className={styles.groupChild2} />
          <div className={styles.frameWrapper}>
            <div className={styles.wrapper11}>
              <div className={styles.div64}>9</div>
            </div>
          </div>
        </div>
        <div className={styles.rectangleGroup}>
          <div className={styles.groupChild2} />
          <div className={styles.frameWrapper}>
            <div className={styles.wrapper11}>
              <div className={styles.div64}>9</div>
            </div>
          </div>
        </div>
        <div className={styles.slider3}>
          <div className={styles.sliderChild} />
        </div>
        <div className={styles.slider4}>
          <div className={styles.sliderChild} />
        </div>
        <div className={styles.slider5}>
          <div className={styles.sliderChild} />
        </div>
        <div className={styles.slider6}>
          <div className={styles.sliderChild} />
        </div>
        <div className={styles.slider7}>
          <div className={styles.sliderChild} />
        </div>
        <div className={styles.wrapper13}>
          <div className={styles.div64}>9</div>
        </div>
        <div className={styles.wrapper14}>
          <div className={styles.div64}>9</div>
        </div>
        <div className={styles.wrapper15}>
          <div className={styles.div64}>9</div>
        </div>
        <div className={styles.wrapper16}>
          <div className={styles.div64}>9</div>
        </div>
        <div className={styles.wrapper17}>
          <div className={styles.div64}>9</div>
        </div>
        <div className={styles.resultChild8} />
        <div className={styles.resultChild9} />
        <div className={styles.resultChild10} />
        <div className={styles.wrapper18}>
          <div className={styles.div72}>25</div>
        </div>
        <div className={styles.wrapper19}>
          <div className={styles.div72}>25</div>
        </div>
        <div className={styles.wrapper20}>
          <div className={styles.div74}>-1</div>
        </div>
        {data.previews.foot ? (
          <img className={styles.p11002571Icon} src={data.previews.foot} alt="足指" />
        ) : (
          <img className={styles.p11002571Icon} alt="" />
        )}
        <div className={styles.div75}>正常</div>
        <div className={styles.div76}>重度</div>
        <div className={styles.div77}>正常</div>
        <div className={styles.div78}>重度</div>
        <div className={styles.div79}>正常</div>
        <div className={styles.div80}>重度</div>
        <div className={styles.div81}>右</div>
        <div className={styles.div82}>左</div>
        <div className={styles.resultChild11} />
        <div className={styles.wrapper21}>
          <div className={styles.div83}>外反母趾</div>
        </div>
        <div className={styles.resultChild12} />
        <div className={styles.wrapper22}>
          <div className={styles.div84}>{foot ? `${Math.round(foot.hallux_right)}°` : "30°"}</div>
        </div>
        <div className={styles.resultChild13} />
        <div className={styles.div85}>右</div>
        <div className={styles.div86}>左</div>
        <div className={styles.resultChild14} />
        <div className={styles.wrapper23}>
          <div className={styles.div83}>内反小趾</div>
        </div>
        <div className={styles.resultChild15} />
        <div className={styles.resultChild16} />
        <div className={styles.div88}>右</div>
        <div className={styles.div89}>左</div>
        <div className={styles.resultChild17} />
        <div className={styles.wrapper24}>
          <div className={styles.div83}>開帳足％</div>
        </div>
        <div className={styles.resultChild18} />
        <div className={styles.resultChild19} />
        <button type="button" className={styles.lock} onClick={() => navigate({ to: "/" })}>
          <div className={styles.div91}>
            <div className={styles.div92}>もう一度分析する</div>
          </div>
        </button>
        <div className={styles.resultInner2}>
          <div className={styles.frameChild} />
        </div>
        <div className={styles.div93}>姿勢スコア基準表</div>
        <div className={styles.background}>
          <img className={styles.backgroundChild} alt="" />
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
        <div className={styles.resultChild24} />
        <div className={styles.mode2}>姿勢コメント</div>
        <div className={styles.mode3}>{side?.comment ?? "首・骨盤・膝は理想的な範囲です"}</div>
        <div className={styles.resultChild25} />
        <div className={styles.mode4}>足指コメント</div>
        <div className={styles.mode5}>
          {foot?.comment ?? "外反母趾と開帳足が認められます。\n\n前足部が広がることで親指への\n負担が増えやすい状態です。\n\n足指をしっかり使う習慣づくりを\nおすすめします。"}
        </div>
        <div className={styles.resultChild26} />
        <div className={styles.mode6}>姿勢コメント</div>
        <div className={styles.mode7}>{front?.comment ?? "首・骨盤・膝は理想的な範囲です"}</div>
        <div className={styles.parent6}>
          {data.previews.side ? (
            <img className={styles.icon} src={data.previews.side} alt="真横" />
          ) : (
            <img className={styles.icon} alt="" />
          )}
          <div className={styles.groupChild4} />
          <div className={styles.groupInner} />
          <div className={styles.div104}>後</div>
          <div className={styles.div43}>前</div>
        </div>
        <div className={styles.wrapper25}>
          <div className={styles.div84}>{foot ? `${Math.round(foot.hallux_left)}°` : "30°"}</div>
        </div>
        <div className={styles.wrapper26}>
          <div className={styles.div84}>{foot ? `${Math.round(foot.tailor_right)}°` : "30°"}</div>
        </div>
        <div className={styles.wrapper27}>
          <div className={styles.div84}>{foot ? `${Math.round(foot.tailor_left)}°` : "30°"}</div>
        </div>
        <div className={styles.wrapper28}>
          <div className={styles.div109}>{foot ? Math.round(foot.splay_right) : 42}</div>
        </div>
        <div className={styles.wrapper29}>
          <div className={styles.div109}>{foot ? Math.round(foot.splay_left) : 42}</div>
        </div>
      </div>
    </div>
  );
}
