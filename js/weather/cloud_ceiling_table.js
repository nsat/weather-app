var table = document.createElement('table');
var headers = document.createElement('tr');
var time = document.createElement('th');
var value = document.createElement('th');
time.innerHTML = 'Time';
value.innerHTML = 'Value';
headers.appendChild(time);
headers.appendChild(value);
table.appendChild(headers);

for (var i=0; i < ceiling.length; i++) {
  var data = ceiling[i];
  var row = document.createElement('tr');
  var t = data['Time'];
  var v = data['Value'];
  row.appendChild(t);
  row.appendChild(v);
  table.appendChild(row);
}

var vis_div = document.getElementById('op_ceiling');
vis_div.innerHTML = '';
vis_div.appendChild(table);

<table>
  <tr>
    <th>Time</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>Alfreds Futterkiste</td>
    <td>Maria Anders</td>
    <td>Germany</td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td>Mexico</td>
  </tr>
  <tr>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td>Austria</td>
  </tr>
  <tr>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td>UK</td>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td>Canada</td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td>Italy</td>
  </tr>
</table>