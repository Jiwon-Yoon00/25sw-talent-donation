import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

const GraphCard = ({ datas = [], days = 7 }) => {
  const chartRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
        dateFormats: {
          day: "MM-dd",
        },
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series1 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "평균 타수",
        xAxis,
        yAxis,
        valueYField: "avgWpm",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY} 타",
        }),
        stroke: am5.color(0x4caf50),
      })
    );

    const series2 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "최고 타수",
        xAxis,
        yAxis,
        valueYField: "maxWpm",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY} 타",
        }),
        stroke: am5.color(0xff5722),
      })
    );

    series1.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0x4caf50),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
        }),
      });
    });

    series2.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0xff5722),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
        }),
      });
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    const legend = chart.children.push(am5.Legend.new(root, {}));
    legend.data.setAll(chart.series.values);

    // 데이터 처리
    if (datas && datas.length > 0) {
      const processedData = datas
        .slice(0, days)
        .map((d) => ({
          date: new Date(d.date).getTime(),
          avgWpm: d.avgWpm ?? 0,
          maxWpm: d.maxWpm ?? 0,
        }))
        .sort((a, b) => a.date - b.date); 

      series1.data.setAll(processedData);
      series2.data.setAll(processedData);
    }

    chart.appear(0, 0);

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [datas, days]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default GraphCard;