import { T_PersonDetails } from "./types";

export const PersonDetails = ({ person }: T_PersonDetails) => {
  return (

      <section className="grid gap-8 rounded-xl border border-border bg-surface p-6 shadow-[0_18px_40px_var(--shadow-color)] md:grid-cols-[280px_1fr]">
        <div>
          {person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
              alt={person.name}
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center rounded-lg bg-surface-muted text-muted">
              No photo
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-accent">
            {person.known_for_department ?? "Person"}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-foreground">
            {person.name}
          </h1>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Birthday</dt>
              <dd className="mt-1 text-foreground">
                {person.birthday ?? "Unknown"}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Place of birth</dt>
              <dd className="mt-1 text-foreground">
                {person.place_of_birth ?? "Unknown"}
              </dd>
            </div>

            {person.deathday && (
              <div>
                <dt className="text-muted">Died</dt>
                <dd className="mt-1 text-foreground">{person.deathday}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Biography
            </h2>

            <p className="mt-2 whitespace-pre-line leading-7 text-muted">
              {person.biography || "Biography is not available."}
            </p>
          </div>

          {person.also_known_as?.length ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">
                Also known as
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {person.also_known_as.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

  );
};