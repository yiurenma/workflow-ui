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
            colorPrimary: "#2563eb",
            borderRadius: 8,
          },
          components: {
            Layout: {
              headerBg: "#ffffff",
            },
            Menu: {
              horizontalItemSelectedColor: "#2563eb",
            },
          },
        }}
      >
        <Layout className="h-dvh bg-slate-50">
          <Header className="flex items-center justify-between px-4 md:px-8 h-14 leading-none bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <AppstoreOutlined className="text-xl text-slate-700 shrink-0" />
              <span className="font-semibold text-slate-800 text-base truncate">
                Application Management
              </span>
            </div>
            <Menu
              mode="horizontal"
              selectable={false}
              items={menuItems}
              className="border-none flex-1 justify-end min-w-0 max-md:!text-sm bg-transparent"
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
