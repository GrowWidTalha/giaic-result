import * as path from "path"
import * as fs from "fs"

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            const src = path.resolve(process.cwd(), 'data/students.json');
            const dest = path.resolve(process.cwd(), '.next/data/students.json');

          // Create the destination directory if it doesn't exist
          fs.mkdirSync(path.dirname(dest), { recursive: true });

          // Copy the file to the .next folder
          fs.copyFileSync(src, dest);
        }
        return config;
      },
};

export default nextConfig;
