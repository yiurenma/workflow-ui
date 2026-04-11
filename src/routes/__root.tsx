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
            colorPrimary: "#5B5BD6",
            borderRadius: 8,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            colorBgContainer: "#FFFFFF",
            colorBorder: "#E2DDD9",
            colorBorderSecondary: "#EDE9E5",
            colorText: "#1A1918",
            colorTextSecondary: "#6B6560",
          },
          components: {
            Layout: {
              headerBg: "#0F0F16",
              bodyBg: "#F8F7F5",
            },
            Menu: {
              darkItemBg: "#0F0F16",
              darkItemSelectedBg: "#1E1E2C",
              darkItemHoverBg: "#1E1E2C",
              darkItemColor: "#9A9AAA",
              darkItemSelectedColor: "#EEEEF8",
              darkItemHoverColor: "#EEEEF8",
              horizontalItemSelectedColor: "#A5A5F0",
            },
            Button: {
              borderRadius: 8,
              fontWeight: 500,
            },
            Table: {
              headerBg: "#FAFAF8",
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
        <Layout className="h-dvh" style={{ background: "#F8F7F5" }}>
          <Header
            className="flex items-center justify-between px-3 md:px-8 leading-none"
            style={{ height: 52, background: "#0F0F16", borderBottom: "1px solid #1E1E2C" }}
          >
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <div
                className="flex items-center justify-center w-[26px] h-[26px] rounded-md shrink-0"
                style={{
                  background: "rgba(165,165,240,0.10)",
                  border: "1px solid rgba(165,165,240,0.18)",
                }}
              >
                <AppstoreOutlined className="text-[12px]" style={{ color: "#A5A5F0" }} />
              </div>
              <span
                className="font-semibold text-[13px] truncate hidden sm:inline"
                style={{ color: "#EAEAF6", letterSpacing: "-0.025em" }}
              >
                Workflow Studio
              </span>
              <span className="text-xs mx-1 shrink-0 hidden sm:inline" style={{ color: "#2A2A3A" }}>
                |
              </span>
            </div>
            <Menu
              mode="horizontal"
              theme="dark"
              selectable={false}
              items={menuItems}
              className="border-none flex-1 justify-end min-w-0 [&_.ant-menu-item]:px-2 md:[&_.ant-menu-item]:px-4"
              style={{ background: "#0F0F16" }}
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
