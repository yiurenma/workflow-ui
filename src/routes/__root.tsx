import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConfigProvider, Layout, Menu, MenuProps } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "Home",
    label: <Link to="/">Home</Link>,
    icon: <HomeOutlined />,
  },
  {
    key: "Applications",
    label: <Link to="/workflows">Applications</Link>,
    icon: <UnorderedListOutlined />,
  },
  {
    key: "Records",
    label: <Link to="/records">Records</Link>,
    icon: <FileTextOutlined />,
  },
  {
    key: "About",
    label: <Link to="/about">About</Link>,
    icon: <InfoCircleOutlined />,
  },
];

export const Route = createRootRoute({
  component: () => (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#7C4A3A",
            colorPrimaryHover: "#9A5C49",
            borderRadius: 8,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            colorBgContainer: "#FFFFFF",
            colorBorder: "#DDD8D0",
            colorBorderSecondary: "#EAE6DF",
            colorText: "#2A2520",
            colorTextSecondary: "#6B6560",
            colorBgLayout: "#F9F7F4",
          },
          components: {
            Layout: {
              headerBg: "#2A2520",
              bodyBg: "#F9F7F4",
            },
            Menu: {
              darkItemBg: "#2A2520",
              darkItemSelectedBg: "#3D3530",
              darkItemHoverBg: "#3D3530",
              darkItemColor: "#C9A87C",
              darkItemSelectedColor: "#E8E0D5",
              darkItemHoverColor: "#E8E0D5",
              horizontalItemSelectedColor: "#C9A87C",
            },
            Button: {
              borderRadius: 8,
              fontWeight: 500,
            },
            Table: {
              headerBg: "#F3F0EB",
              rowHoverBg: "#EEF5F0",
            },
            Modal: {
              borderRadiusLG: 14,
            },
            Drawer: {
              borderRadiusLG: 14,
            },
          },
        }}
      >
        <Layout className="h-dvh" style={{ background: "#F9F7F4" }}>
          <Header
            className="flex items-center justify-between px-3 md:px-8 leading-none border-b"
            style={{ height: 52, background: "#2A2520", borderColor: "#3D3530" }}
          >
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <AppstoreOutlined className="text-base shrink-0" style={{ color: "#C9A87C" }} />
              <span
                className="font-semibold truncate hidden sm:inline"
                style={{ fontFamily: "'Lora', Georgia, serif", color: "#E8E0D5", fontSize: 15, letterSpacing: "0.02em" }}
              >
                Workflow Studio
              </span>
              <span className="text-xs mx-1 shrink-0 hidden sm:inline" style={{ color: "#3D3530" }}>
                |
              </span>
            </div>
            <Menu
              mode="horizontal"
              theme="dark"
              selectable={false}
              items={menuItems}
              className="border-none flex-1 justify-end min-w-0 [&_.ant-menu-item]:px-2 md:[&_.ant-menu-item]:px-4"
              style={{ background: "#2A2520" }}
            />
          </Header>
          <Content className="flex-1 overflow-hidden">
            <div className="h-full">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
      <TanStackRouterDevtools />
    </>
  ),
});
