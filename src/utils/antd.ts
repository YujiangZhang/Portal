import type { GetProp, UploadProps } from "antd";

/**
 *  根据 antd 的 upload 示例得到的，获取图片的 base64
 * @param img => upload 时 info.file.originFileObj
 * @param callback => 回调函数
 */
export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export function uploadGetBase64(
  img: FileType,
  callback: (url: string) => void
) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
}
