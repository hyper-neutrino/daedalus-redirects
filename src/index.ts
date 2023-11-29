import { Elysia } from "elysia";
import pino from "pino";

const log = pino({ level: "trace" });

const f = (set: { redirect?: string; status?: number | string }, s: string) => {
    set.redirect = `https://daedalusbot.xyz${s}`;
    set.status = 308;
};

const direct = [
    "/",
    "/docs",
    "/docs/guides/custom-messages",
    "/docs/guides/permissions",
    "/docs/introduction",
    "/docs/modules-commands",
    "/docs/permissions",
    "/privacy",
    "/terms",
];

const mapped = {
    "/docs/guides/index": "/docs/guides",
};

const missingModules = [
    "core",
    "moderation",
    "reminders",
    "polls",
    "highlights",
    "sticky-messages",
    "fun",
];

const directModules = [
    "welcome",
    "supporter-announcements",
    "xp",
    "reaction-roles",
    "starboard",
    "automod",
    "sticky-roles",
    "custom-roles",
    "stats-channels",
    "autoresponder",
    "modmail",
    "tickets",
    "nukeguard",
    "suggestions",
    "co-op",
    "count",
    "giveaways",
    "reports",
    "utility",
];

const mappedModules = { feeds: "reddit-feeds" };

let app = new Elysia()
    .get("/modmail/:gid/:id", ({ set, params: { gid, id } }) =>
        f(set, `/old/modmail/${gid}/${id}`)
    )
    .get("/ticket/:gid/:id", ({ set, params: { gid, id } }) =>
        f(set, `/old/ticket/${gid}/${id}`)
    )
    .get("/auth/:path", ({ set, params: { path } }) => f(set, `/auth/${path}`))
    .get("/docs/module/:module", ({ set, params: { module } }) =>
        f(set, `/docs/modules/${module}`)
    )
    .get("/manage/:id", ({ set, params: { id } }) => f(set, `/manage/${id}`))
    .get("/manage/:id/settings", ({ set, params: { id } }) =>
        f(set, `/manage/${id}`)
    )
    .get("/manage/:id/api-tokens", ({ set, params: { id } }) =>
        f(set, `/manage/${id}`)
    );

for (const path of direct) app = app.get(path, ({ set }) => f(set, path));
for (const [src, dst] of Object.entries(mapped))
    app = app.get(src, ({ set }) => f(set, dst));
for (const module of missingModules)
    app = app.get(`/manage/:id/module/${module}`, ({ set, params: { id } }) =>
        f(set, `/manage/${id}`)
    );
for (const module of directModules)
    app = app.get(`/manage/:id/module/${module}`, ({ set, params: { id } }) =>
        f(set, `/manage/${id}/${module}`)
    );
for (const [src, dst] of Object.entries(mappedModules))
    app = app.get(`/manage/:id/module/${src}`, ({ set, params: { id } }) =>
        f(set, `/manage/${id}/${dst}`)
    );

app = app.get("/*", ({ set }) => f(set, "/"));

app = app.listen(Bun.env.PORT || 3000);

log.info(`Server started at ${app.server?.hostname}:${app.server?.port}`);
