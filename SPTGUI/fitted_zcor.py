# Getter to load precomputed fits.
# To do that in a nice way, we implement a KD-tree so that the
# algorithm returns the nearest neighbour in the (dZ, dT)
#
# By MW, GPLv3+, May 2017

## ==== Imports
import os
import numpy as np
from scipy.spatial import cKDTree as KDTree
import pandas as pd

## ==== Main functions
def init(path, scale_t=1000.0):
    """Function that instanciates the KD-tree.
    Inspired from: http://stackoverflow.com/questions/28177114/merge-join-2-dataframes-by-complex-criteria/28186940#28186940
    returns an object: kd_init
    """
    # Parse the input directory
    li = os.listdir(path)
    xy_raw = [(i, float(i.split('_')[2][2:])*scale_t, float(i.split('_')[3][2:-4])) for i in li]
    xy = pd.DataFrame([{"dT": i[1], "dZ": i[2], "fn": i[0]} for i in xy_raw])
    print "Found {} files of fits in folder {}".format(len(xy_raw), path)
    
    join_cols = ['dT', "dZ"]
    tree = KDTree(xy[join_cols])
    return {"tree": tree, "df": xy, "path": path, "scale_t": scale_t}

def query_nearest(dT, dZ, tree_init):
    # Deparse
    tree = tree_init["tree"]
    df1 = tree_init["df"]
    path = tree_init["path"]
    df2 = pd.DataFrame([{"dT":dT*tree_init["scale_t"], "dZ":dZ}])
    join_cols = ["dT", "dZ"]
    
    # Query and merge
    distance, indices = tree.query(df2[join_cols])
    df1_near_2 = df1.take(indices).reset_index(drop=True)
    left = df1_near_2
    right = df2.rename(columns=lambda l: l + "_query")
    merged = pd.concat([left, right], axis=1)
    
    # Open dict
    fn = merged.fn[0]
    data = np.load(os.path.join(path, fn))
    params = [i for i in data["params"]]
    
    ret = {"dT_query": float(dT), "dZ_query": float(dZ), 
           "dT": merged["dT"][0]/tree_init["scale_t"], "dZ": merged["dZ"][0],
           "fn": fn, "ssq2": data["ssq2"], "params": params, "path": path}
    return ret