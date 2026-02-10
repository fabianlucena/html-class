window.addEventListener('popstate', () => {
  router(window.location.pathname);
});

export function navigate(path, { skipRouter = false } = {}) {
  history.pushState({}, '', path);
  if (!skipRouter) {
    router(window.location.pathname);
  }
}

const routers = [];
export function registerRouter(callback) {
  routers.push(callback);
}

export function router(path) {
  for (const r of routers) {
    if (r(path)) {
      return;
    }
  }
}