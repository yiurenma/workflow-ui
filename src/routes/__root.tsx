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
            colorPrimary: "#0f62fe",
            colorPrimaryHover: "#0353e9",
            borderRadius: 0,
            fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
            colorBgContainer: "#ffffff",
            colorBorder: "#c6c6c6",
            colorBorderSecondary: "#e0e0e0",
            colorText: "#161616",
            colorTextSecondary: "#525252",
            colorBgLayout: "#ffffff",
            colorError: "#da1e28",
            colorSuccess: "#24a148",
            colorWarning: "#f1c21b",
          },
          components: {
            Layout: {
              headerBg: "#161616",
              bodyBg: "#ffffff",
            },
            Menu: {
              darkItemBg: "#161616",
              darkItemSelectedBg: "#262626",
              darkItemHoverBg: "#262626",
              darkItemColor: "#c6c6c6",
              darkItemSelectedColor: "#ffffff",
              darkItemHoverColor: "#ffffff",
              horizontalItemSelectedColor: "#ffffff",
            },
            Button: {
              borderRadius: 0,
              fontWeight: 400,
              controlHeight: 40,
            },
            Table: {
              headerBg: "#f4f4f4",
              rowHoverBg: "#f4f4f4",
              borderColor: "#e0e0e0",
            },
            Modal: {
              borderRadiusLG: 0,
            },
            Drawer: {
              borderRadiusLG: 0,
            },
            Input: {
              borderRadius: 0,
              colorBgContainer: "#f4f4f4",
              activeBorderColor: "#0f62fe",
              hoverBorderColor: "#0f62fe",
            },
            Tag: {
              borderRadius: 24,
            },
          },
        }}
      >
        <Layout className="h-dvh" style={{ background: "#ffffff" }}>
          <Header
            className="flex items-center justify-between px-3 md:px-8 leading-none border-b"
            style={{ height: 48, background: "#161616", borderColor: "#393939" }}
          >
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <AppstoreOutlined className="text-base shrink-0" style={{ color: "#ffffff" }} />
              <span
                className="font-semibold truncate hidden sm:inline"
                style={{ fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', color: "#ffffff", fontSize: 14, letterSpacing: "0.16px", fontWeight: 600 }}
              >
                Workflow Studio
              </span>
              <span className="text-xs mx-1 shrink-0 hidden sm:inline" style={{ color: "#525252" }}>
                |
              </span>
            </div>
            <Menu
              mode="horizontal"
              theme="dark"
              selectable={false}
              items={menuItems}
              className="border-none flex-1 justify-end min-w-0 [&_.ant-menu-item]:px-2 md:[&_.ant-menu-item]:px-4"
              style={{ background: "#161616" }}
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
