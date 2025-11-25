import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";  
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const GraphCard = ({ datas, days = 7 }) => {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !datas || datas.length === 0) return;

    // 1️⃣ Root 생성
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    // 2️⃣ 차트 생성
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
      })
    );

    // 3️⃣ X축: DateAxis
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.1,
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      })
    );

    // 라벨 포맷: MM-DD
    xAxis.get("renderer").labels.template.setAll({
      rotation: -45,
      centerY: am5.percent(100),
      centerX: am5.percent(100),
      fontSize: 12,
    });

    // 4️⃣ Y축: ValueAxis
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // 5️⃣ 평균 타수 시리즈
    const avgSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "평균 타수",
        xAxis,
        yAxis,
        valueYField: "avgWpm",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}\n{valueX.formatDate('MM-dd')}",
        }),
        stroke: am5.color(0x4caf50),
        strokeWidth: 2,
      })
    );

    // 6️⃣ 최고 타수 시리즈
    const maxSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "최고 타수",
        xAxis,
        yAxis,
        valueYField: "maxWpm",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}\n{valueX.formatDate('MM-dd')}",
        }),
        stroke: am5.color(0xff5722),
        strokeWidth: 2,
      })
    );

    // 7️⃣ Cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    // 8️⃣ Legend
    const legend = chart.children.push(am5.Legend.new(root, {}));
    legend.data.setAll(chart.series.values);

    // 9️⃣ 데이터 처리: 최근 n일
    const sortedSessions = [...datas]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-days)
      .map((s) => ({
        ...s,
        date: new Date(s.date), // DateAxis는 반드시 Date 객체
      }));

      console.log(sortedSessions);

      
    avgSeries.data.setAll(sortedSessions);
    maxSeries.data.setAll(sortedSessions);

    // 10️⃣ Cleanup
    return () => {
      root.dispose();
    };
  }, [datas, days]);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "400px" }} />
  );
};

export default GraphCard;
