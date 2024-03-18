import {
  Profile,
  BookMark,
  Search,
  Memo,
  PostList,
} from "../components/module";
import { Col, Flex, Row, Space } from "antd";
import style from "./page.module.css";

export default function Home() {
  return (
    <>
      <Row
        className={style.main}
        align="middle"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Col xs={24} md={8}>
          <Flex vertical align="center" justify="center" gap={26}>
            <Profile />
            {/* <Memo /> */}
          </Flex>
        </Col>
        <Col xs={22} md={14} className={style.main}>
          <Flex vertical align="center" justify="center" gap={36}>
            <Space direction="vertical" align="center" size={32}>
              <Search />
              <BookMark />
            </Space>
            <PostList />
          </Flex>
        </Col>
      </Row>
      <Memo />
    </>
  );
}
