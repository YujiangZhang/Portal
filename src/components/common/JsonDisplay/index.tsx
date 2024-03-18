export default function JsonDisplay({
  data,
  replacer,
  space = 2,
}: {
  data: any;
  replacer?: ((key: string, value: any) => any) | undefined;
  space?: string | number | undefined;
}): JSX.Element {
  return <pre>{JSON.stringify(data, replacer, space)}</pre>;
}
