import { Modal, ModalFuncProps } from 'antd';

/**
 * Carbon Design System styled modal wrapper
 * Ensures all modals follow IBM Carbon Design Language
 */
export function CarbonModal(props: any) {
  return (
    <Modal
      {...props}
      className={`carbon-modal ${props.className || ''}`}
      styles={{
        content: { borderRadius: 0 },
        header: { borderBottom: '1px solid #e0e0e0' },
        ...props.styles,
      }}
    />
  );
}

/**
 * Carbon-styled confirmation dialog
 * Use this instead of Modal.confirm() to ensure Carbon styling
 */
export function carbonConfirm(config: ModalFuncProps) {
  return Modal.confirm({
    ...config,
    className: `carbon-modal ${config.className || ''}`,
    okButtonProps: {
      style: { borderRadius: 0 },
      ...config.okButtonProps,
    },
    cancelButtonProps: {
      style: { borderRadius: 0 },
      ...config.cancelButtonProps,
    },
  });
}

/**
 * Carbon-styled info dialog
 */
export function carbonInfo(config: ModalFuncProps) {
  return Modal.info({
    ...config,
    className: `carbon-modal ${config.className || ''}`,
    okButtonProps: {
      style: { borderRadius: 0 },
      ...config.okButtonProps,
    },
  });
}

/**
 * Carbon-styled warning dialog
 */
export function carbonWarning(config: ModalFuncProps) {
  return Modal.warning({
    ...config,
    className: `carbon-modal ${config.className || ''}`,
    okButtonProps: {
      style: { borderRadius: 0 },
      ...config.okButtonProps,
    },
  });
}

/**
 * Carbon-styled error dialog
 */
export function carbonError(config: ModalFuncProps) {
  return Modal.error({
    ...config,
    className: `carbon-modal ${config.className || ''}`,
    okButtonProps: {
      style: { borderRadius: 0 },
      ...config.okButtonProps,
    },
  });
}
