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
            colorPrimary: "#4F46E5",
            borderRadius: 6,
          },
          components: {
            Layout: {
              headerBg: "#18181B",
            },
            Menu: {
              darkItemBg: "#18181B",
              darkItemSelectedBg: "#27272A",
              darkItemHoverBg: "#27272A",
              darkItemColor: "#A1A1AA",
              darkItemSelectedColor: "#F4F4F5",
              darkItemHoverColor: "#F4F4F5",
              horizontalItemSelectedColor: "#818CF8",
            },
          },
        }}
      >
        <Layout className="h-dvh bg-zinc-50">
          <Header className="flex items-center justify-between px-3 md:px-8 h-12 leading-none bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <AppstoreOutlined className="text-base text-zinc-400 shrink-0" />
              <span className="font-semibold text-zinc-100 text-[13px] tracking-tight truncate hidden sm:inline">
                Workflow Studio
              </span>
              <span className="text-zinc-700 text-xs mx-1 shrink-0 hidden sm:inline">|</span>
            </div>
            <Menu
              mode="horizontal"
              theme="dark"
              selectable={false}
              items={menuItems}
              className="border-none flex-1 justify-end min-w-0 !bg-zinc-900 [&_.ant-menu-item]:px-2 md:[&_.ant-menu-item]:px-4"
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
