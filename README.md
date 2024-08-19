# Mailtrain v3

## Building it

1. Install Node.js v20 and npm.

2. Get Mailtrain from git
    ```
    git clone https://github.com/Mailtrain-org/mailtrain.git
    cd mailtrain
    git checkout v3
    ```

3. Install dependencies in `client`, `shared`, `server`, `zone-mta`.
   ```
   for dir in client shared server zone-mta; do (cd $dir && npm install); done
   ```

4. Build the client.
   ```
   (cd client && npm run build)
   ```

Alternatively, when doing the development, run `npm run watch` in client. This builds the client, but keeps
watching for changes in client source files. It recompiles the client upon any changes in the sources.

## License

  **GPL-V3.0**
