/**
 * Created by alexandre on 29/12/2017.
 */


let _isSetEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (var ai of a) if (!b.has(ai)) return false;
  return true;
};


class DataCube {
  constructor(data) {
    this.source = data;
    this.data = [];
    this.cells = [];
    this.fields = [];
    this.xFields = [];
    this.yFields = [];
    this.measures = [];
  }

  groupBy() {
    let lastGroup = [], newGroup, summary = {}, curVals, val, v, keep;

    let rows = [], cols = [], cells = [], xIndices = {}, yIndices = {};

    let xfields, yfields, yValues, xValues, colCount = 0, rowCount = 0;
    if (this.xFields.length) xfields = this.xFields;
    else xfields = [null];
    if (this.yFields.length) yfields = this.yFields;
    else yfields = [null];

    let fields = [], f, i;
    let x = 0, y = 0;
    let xbr = false, ybr = false;


    for (let row of this.source) {
      newGroup = [];
      xValues = [];
      yValues = [];

      // check grouping and generate cells
      keep = true;
      i = 0;
      for (f of yfields) {
        v = row[f];
        newGroup.push(v);
        yValues.push(v);
        if (lastGroup[i] !== v) {
          keep = false;
          ybr = true;
          i = yfields.length - i;
          while (--i>0) newGroup.push(null);
          break;
        }
        i++;
      }

      for (f of xfields) {
        v = row[f];
        newGroup.push(v);
        xValues.push(v);
        if (lastGroup[i] !== v) {
          keep = false;
          xbr = true;
          i = xfields.length - i;
          while (--i>0) newGroup.push(null);
          break;
        }
        i++;
      }

      if (!keep) {
        var groupHash = newGroup.toString();
        if (summary[groupHash] === undefined) {
          lastGroup = newGroup;
          if (ybr) {
            var yHash = yValues.toString();
            y = yIndices[yHash];
            if (y === undefined) {
              y = rows.length;
              yIndices[yHash] = y;
              rows.push(yValues);
              cells.push([]);
            }
          }
          if (xbr) {
            var xHash = xValues.toString();
            x = xIndices[xHash];
            if (x === undefined) {
              x = cols.length;
              xIndices[xHash] = x;
              cols.push(xValues);
            }
          }
          var newVals = {};
          for (val of this.measures) {
            var cell = {};
            newVals[val] = cell;
            cell.value = 0;
            cell.count = 0;
            if (xbr) cells[y].push(cell);
          }
          summary[groupHash] = newVals;
        }
        curVals = summary[groupHash];
        //rows.push();
      }
      for (val of this.measures) {
        cell = curVals[val];
        cell.value += row[val];
        cell.count++;
      }
    }
    console.log('cells', cells);
    //console.log('cols', cols);
    console.log(summary);
  }
}

let testCube = () => {
  let data = [];

  for (var i=0;i<300000;i++) {
    data.push({
      name: 'Person ' + i,
      groupName: 'Group' + i.toString()[0],
      groupName2: 'Group2-' + Math.floor((Math.random() * 10) + 1).toString(),
      value: i
    })
  }

  console.log(data);

  let cube = new DataCube(data);
  console.time('group');
  cube.xFields = ['groupName'];
  cube.yFields = ['groupName2'];
  cube.measures = ['value'];
  cube.groupBy();
  console.timeEnd('group');
};

console.time('testCube');
testCube();
console.timeEnd('testCube');
