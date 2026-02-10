window.addEventListener('popstate', () => {
  router(window.location.pathname);
});

let basePath = '';
export function setBasePath(newBasePath) {
  basePath = newBasePath;
}

export function navigate(path, options = {}) {
  path = (options.basePath ?? basePath) + path;

  history.pushState({}, '', path);
  if (!options.skipRouter) {
    router(window.location.pathname);
  }
}

const routers = [];
export function registerRouter(callback) {
  routers.push(callback);
}

export function router(path, options = {}) {
  const basePathToUse = options.basePath ?? basePath;
  if (path.startsWith(basePathToUse)) {
    path = path.substring(basePathToUse.length);
  }

  for (const r of routers) {
    if (r(path)) {
      return;
    }
  }
}