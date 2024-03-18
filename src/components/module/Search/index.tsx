'use client'
import { Cascader, ConfigProvider, Input, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { getSearchEngineGroups } from "@/api/data";

const { Search } = Input;

interface Option {
  value: string;
  label: string;
  children?: Option[];
  url?: string;
}

const theme = {
  components: {
    Cascader: {
      controlItemWidth: 100,
    },
  },
};

const getOptions = () => {
  const searchEngineGroups = getSearchEngineGroups();
  const options: Option[] = searchEngineGroups.map((group) => {
    return {
      value: group.name,
      label: group.label,
      children: group.searchEngines.map((engine) => {
        return {
          value: engine.name,
          label: engine.label,
          url: engine.url,
        };
      }),
    };
  });
  return options;
};

function SearchInputInstance({
  searchEngine,
}: {
  searchEngine: Option | null;
}) {
  const [query, setQuery] = useState("");

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onSearch = useCallback(() => {
    if (!searchEngine) return;
    window.open(`${searchEngine.url}${query}`, "_blank");
  }, [query, searchEngine]);

  return (
    <Search
      placeholder="搜索"
      onSearch={onSearch}
      onChange={onQueryChange}
    />
  );
}

export default function SearchInput() {
  const [searchEngine, setSearchEngine] = useState<Option | null>(null);
  const options: Option[] = getOptions();

  // Cascader
  const defaultValue = (() => {
    const searchEngine = options[0].children?.[0];
    if (!searchEngine) {
      throw new Error("未找到 searchEngine");
    }
    return [options[0].value, searchEngine.value];
  })();

  const onChange = (value: any[], selectedOptions: any[]) => {
    const engine = _.last(selectedOptions);
    setSearchEngine(engine);
  };

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  useEffect(() => {
    if (!options[0].children) return;
    setSearchEngine(options[0].children[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <Space.Compact>
        <Cascader
          allowClear={false}
          defaultValue={defaultValue}
          options={options}
          onChange={onChange}
          placeholder="选择"
          expandTrigger="hover"
          displayRender={displayRender}
          suffixIcon={null}
          style={{ width: "3.8em"}}
        />
        <SearchInputInstance searchEngine={searchEngine} />
      </Space.Compact>
    </ConfigProvider>
  );
}
