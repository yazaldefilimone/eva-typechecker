<samp>

eva typechecker

source code lang: [eva lang](https://github.com/yazaldefilimone/essentials-of-interpretation)

See examples in `./exemples`;
`./bin/eva-typechecker `


You can run files:

```bash

./bin/eva-typechecker  -f exemples/simple.eva
// or
./bin/eva-typechecker  -f exemples/advanced.eva

```

or expression



```bash

./bin/eva-typechecker  -e '(+ 2 3)'
// or
./bin/eva-typechecker  -e '(lambda ((n1 number) (n2 number)) -> number  (+ n1 n2))'
```

