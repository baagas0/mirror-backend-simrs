function treeMenu( list ) {
	var map = {}, node, roots = [], i;
                
    for (i = 0; i < list.length; i += 1) {
        // console.log(list[i].code);
        map[list[i].code] = i; // init the map
        list[i]._children = []; // init the _children
    }
    
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        // console.log('Parent: ',node);
        if (node.parent_code !== "") {
            // node._name = "CSidebarNavItem";

            // console.log(list[map[node.parent_code]]?._children?.length);
            // console.log('cek')
            // console.log(list[map[node.parent_code]]);
            if(list[map[node.parent_code]]._children == undefined) {
            }

            list[map[node.parent_code]]._children.push(node);
            
            // if(list[map[node.parent_code]]._children !== 0) {
                //     list[map[node.parent_code]]._name = "CSidebarNavDropdown";
                // }
        } else if (node.type == 2) {
            // console.log("asdas");
            // list[map[node.parent_code]]?._children?.push(node);
            roots.push({...node});
        } else {
            // node._name = "CSidebarNavDropdown";
            roots.push({...node});
        }
    }

    // for (i = 0; i < roots.length; i += 1) {
    //     if(roots[i]._children.length == 0) {
            // roots[i]._name = "CSidebarNavItem";
            // delete roots[i]._children;
    //     }
    // }
    
    return roots;
}

function buildFilter(data = []) {
    let filter_text = "";

    for (const filter of data) {
        // console.log(filter);
        if(filter.value) {
            if(filter.type == 'ilike') {
                filter_text += ` and ${filter.as}.${filter.field} ilike '%${filter.value}%'`
            } else if(filter.type == 'like') {
                filter_text += ` and ${filter.as}.${filter.field} like '%${filter.value}%'`
            } else if(filter.type == '=') {
                filter_text += ` and ${filter.as}.${filter.field} = '${filter.value}'`
            } else if(filter.type == '>') {
                filter_text += ` and ${filter.as}.${filter.field} > '${filter.value}'`
            } else if(filter.type == '<') {
                filter_text += ` and ${filter.as}.${filter.field} < '${filter.value}'`
            } else if(filter.type == '>=') {
                filter_text += ` and ${filter.as}.${filter.field} >= '${filter.value}'`
            } else if(filter.type == '<=') {
                filter_text += ` and ${filter.as}.${filter.field} <= '${filter.value}'`
            } else if(filter.type == 'date >=') {
                filter_text += ` and date(${filter.as}.${filter.field}) >= '${filter.value}'`
            } else if(filter.type == 'date <=') {
                filter_text += ` and date(${filter.as}.${filter.field}) <= '${filter.value}'`
            } else if(filter.type == 'in') {
                if (typeof filter.value === 'object') {
                    let  values = "('" + filter.value.join("', '") + "')"
                    console.log(values)
                    filter_text += ` and  ${filter.as}.${filter.field} in ${values} `
                }
            }
        }
    }

    return filter_text;
}

module.exports = { treeMenu, buildFilter }