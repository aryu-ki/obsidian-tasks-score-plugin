# Overview

This plugin calculates total score for the tasks on the page ([Tasks plugin](https://github.com/obsidian-tasks-group/obsidian-tasks))

# Usage

Just add score notation for your task like this
```
// before
- [x] My task ...
// with score
- [x] [3] My task ...
```
And then, anywhere in the code
````
```evals
Score: !score!/3
```
````

Which will evaluate in
```html
<h1>Score: 3/3</h1>
```
and be rendered as
# Score 3/3
