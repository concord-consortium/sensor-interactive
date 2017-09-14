rm -rf dist
git clone -b gh-pages git@github.com:concord-consortium/sensor-interactive.git dist
npm run build
cd dist
git add . && git commit -m 'Update gh-pages' && git push origin gh-pages
