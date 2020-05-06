Webmap (using leaflet) for visualizing data for electrification planning in Nigeria
## Getting started

After cloning this repository, checkout the `dev` branch
```
git checkout dev
```

Create a virtual environment (with python3), then
```
pip3 install -r app/requirements.txt
```

Start the app with  
```
python3 index.py
```

## Notes to future code-developers

The UI specifies two types of clusters : "Identified settlements by satellite imagery" and
 "Remotely mapped settlements". In the code those are referred to as `cluster_all` or `cluster_type
 ='all'` and `cluster_og` or `cluster_type
 ='og'`, respectively. The reason behind this name discrepancy is that the names changed long
  after the code was written.
