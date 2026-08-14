import { useI18n } from "@/shared/i18n";
import { T_Repo } from "./types";
import { Avatar } from "@/shared/ui/Avatar";

export type Item = {
  item: T_Repo;
  index: number;
};

export const PopularCard = ({ item, index }: Item) => {

  const { t } = useI18n();

  return (
    <div className="flex h-72 flex-col rounded-lg border border-border bg-surface p-5 shadow-[0_18px_40px_var(--shadow-color)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted">#{index + 1}</span>

        <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs text-muted">
          {item.language || t("popular.unknownLanguage")}
        </span>
      </div>

      <h2 className="h-14 overflow-hidden break-words text-lg font-semibold leading-7 text-foreground">
        {item.name}
      </h2>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <Avatar
          src={item.owner.avatar_url}
          alt={item.owner.login}
          size="small"
        />
        <span className="truncate">{item.owner.login}</span>
      </div>

      <p className="mt-4 h-18 overflow-hidden text-sm leading-6 text-muted">
        {item.description || t("popular.cardDescriptionFallback")}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-semibold text-accent">
           {item.stargazers_count.toLocaleString()} {t("popular.stars")}
        </span>

        <a
          href={item.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-foreground transition hover:text-accent"
        >
          {t("popular.viewRepo")}
        </a>
      </div>
    </div>
  );
};
