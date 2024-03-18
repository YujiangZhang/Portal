export async function getImageSrc(
  url: string | undefined | null,
  func: (url: string) => void,
  errorFunc?: (error: Error) => void
) {
  try {
    if (!url) return;
    const response = await fetch(url);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onload = () => {
      func(reader.result as string);
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(`加载图片失败 ${url}`, error);
    if (errorFunc) {
      errorFunc(error as Error);
    }
  }
}
