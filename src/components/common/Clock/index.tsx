"use client";
import { Card, Col, Row, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import Image from "next/image";

function Formater({ title, value }: { title: string; value: string }) {
  return (
    <Card size="small">
      <div className="color-40">{title}</div>
      <div className="color-80">{value}</div>
    </Card>
  );
}

export default function Clock({
  column,
  gap = 6,
  width = "13rem",
}: {
  column?: boolean;
  gap?: number;
  width?: string;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
    setTime(new Date().toLocaleTimeString());

    const timer = setInterval(() => {
      const now = new Date();
      setDate(now.toLocaleDateString());
      setTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!date || !time) {
    return null;
  }

  return (
    <Row
      gutter={gap}
      style={{
        width,
        margin: "auto",
      }}
    >
      <Col span={column ? 24 : 12}>
        <Formater title="Date" value={date} />
      </Col>
      <Col span={column ? 24 : 12}>
        <Formater title="Time" value={time} />
      </Col>
    </Row>
  );
}
