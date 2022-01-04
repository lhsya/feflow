import spawn from 'cross-spawn';

export function getRegistryUrl(packageManager: string) {
  return new Promise<string>((resolve, reject) => {
    const command = packageManager;
    const args = ['config', 'get', 'registry'];

    const child = spawn(command, args, { windowsHide: true });

    let output = '';

    child.stdout!.on('data', (data) => {
      output += data;
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      output = output.replace(/\n/, '').replace(/\/$/, '');
      resolve(output);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export function install(packageManager: string, root: string, cmd: string, dependencies: string[], verbose: boolean) {
  return new Promise<void>((resolve, reject) => {
    const command = packageManager;
    const args = [cmd, '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit', cwd: root, windowsHide: true });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
}

export function isInstalledPM(packageName: string) {
  try {
    const ret = spawn.sync(packageName, ['-v'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return ret.status === 0;
  } catch (err) {
    return false;
  }
}
