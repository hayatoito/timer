build:
	polymer build

update:
	yarn install

serve:
	polymer serve

lint:
	eslint src/my-timer/my-timer.js
	eslint src/index.js
	polymer lint
	ls -l ./build/es6-unbundled

serve-production-build:
	my-http-server --port 8080 &
	open 'http://localhost:8080/build/es6-unbundled/'

publish: build
	git branch -D master || true
	python3 ./ghp-import/ghp_import.py -b master build/es6-unbundled
	git push --force origin master

# https://hayatoito.github.io/timer
# -> Redirects to
# https://hayato.io/timer

.PHONY: build update watch
