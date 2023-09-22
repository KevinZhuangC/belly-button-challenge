// get sample json endpoint
const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';

let all_sorted_samples = [];

let bar_sets = {};
let bubble_sets = {};
let metadata_sets = {};

function init() {
    let init_bar_sample = Object.values(all_sorted_samples)[0]
    let bar_x = [];
    let bar_y = [];
    let bar_hover = [];

    let bubble_first = Object.keys(bubble_sets)[0];
    let bubble_x = bubble_sets[bubble_first][1];
    let bubble_y = bubble_sets[bubble_first][0];
    let bubble_label = bubble_sets[bubble_first][2];

    let metadata_first = Object.values(metadata_sets)[0]
    let metadata_keys = Object.keys(metadata_first)
    let metadata_values = Object.values(metadata_first)
    let metadata_list = []

    // handle bar
    for (sample in init_bar_sample) {
        bar_x.push(init_bar_sample[sample][0])
        bar_y.push(init_bar_sample[sample][1][0])
        bar_hover.push(init_bar_sample[sample][1][1])
    };

    data = [{
        type: 'bar',
        x: bar_x,
        y: bar_y,
        orientation: 'h',
        hovertext: bar_hover
    }];

    var layout = {
        // Reverse the y-axis
        yaxis: {autorange: 'reversed'}
    };
        
    Plotly.newPlot("bar", data,layout);

    // handle bubble
    data = [{
        x: bubble_x,
        y: bubble_y,
        mode: 'markers',
        hovertext: bubble_label,
        marker: {
            color: bubble_x,
            size: bubble_y
        }
    }];
    Plotly.newPlot("bubble", data);

    // handle metadata
    for (n in metadata_keys) {
        metadata_list.push(
            "<div>"+metadata_keys[n]+": "+metadata_values[n]+"<div>"
        )
    }
    metadata_list_as_str ="<div>" + metadata_list.join("") + "<div>";
    document.getElementById("sample-metadata").innerHTML = metadata_list_as_str;
};


// store each outid and its values retuen a dict
function pair_id_samplevalues(sample_dict){
    let paired_list = []
    let sample_length = sample_dict.otu_ids.length

    for (let i = 0; i < sample_length; i++) {
        paired_list.push({
            key: sample_dict.sample_values[i],
            value: ["OTU "+sample_dict.otu_ids[i], sample_dict.otu_labels[i]]
        });
    };
    return paired_list;
};

//sort dict by valus, retuen a sorted list of lists of keys and values, decending
function sort_dict(paired_list){
    let unsorted = [];
    for (key in paired_list){
        unsorted.push([
            paired_list[key].key,
            paired_list[key].value
        ])
    };
    let sorted_list = unsorted.sort((a, b) => b[1] - a[1]);
    return sorted_list;
};

function optionChanged(value) {
    // handle bar
    Plotly.restyle("bar", "x", [bar_sets[value][1]]);
    Plotly.restyle("bar", "y", [bar_sets[value][0]]);
    Plotly.restyle("bar", "hovertext", [bar_sets[value][2]]);

    // handle bubble
    Plotly.restyle("bubble", "x", [bubble_sets[value][1]]);
    Plotly.restyle("bubble", "y", [bubble_sets[value][0]]);
    Plotly.restyle("bubble", "hovertext", [bubble_sets[value][2]]);
    Plotly.restyle("bubble", "marker.color", [bubble_sets[value][1]]);
    Plotly.restyle("bubble", "marker.size", [bubble_sets[value][0]]);

    // handle metadata
    current_metadata = metadata_sets[value]
    current_keys = Object.keys(current_metadata)
    current_values = Object.values(current_metadata)
    
    let current_metadata_list = []
    for (m in current_keys) {
        current_metadata_list.push(
            "<div>"+current_keys[m]+": "+current_values[m]+"<div>"
        )
    }

    current_metadata_list_str ="<div>" + current_metadata_list.join("") + "<div>";
    document.getElementById("sample-metadata").innerHTML = current_metadata_list_str;
}


// Fetch the JSON data and console log it
d3.json(url).then(function(data) {
    let metadata = data.metadata;
    let samples = data.samples

    for (i in samples) {
        // sort samples
        let paired_values = pair_id_samplevalues(samples[i]);
        let sorted_value_list = sort_dict(paired_values);
        
        sliced_list = sorted_value_list
        if (sorted_value_list.length >= 10){
            sliced_list = sorted_value_list.slice(0, 10);
        }
        all_sorted_samples[samples[i].id] = sliced_list;

        // create data list to fill in bubble plot
        bubble_id = samples[i].id;
        bubble_sample_value = samples[i].sample_values;
        bubble_otu_ids = samples[i].otu_ids;
        bubble_otu_labels = samples[i].otu_labels;
        
        bubble_sets[bubble_id] = [
            bubble_sample_value,
            bubble_otu_ids,
            bubble_otu_labels
        ];
    };

    // create data list to fill in metadata panel
    for (j in metadata) {
        metadata_id = metadata[j].id;
        metadata_sets[metadata_id] = metadata[j];
    };

    // create dropdown selection
    var elements = ""
    for (key in all_sorted_samples) {
        elements += "<option value='"+ key + "'>" + key + "</option>";
    }
    document.getElementById("selDataset").innerHTML = elements;

    for (key in all_sorted_samples) {
        id = key
        sorted_samples = all_sorted_samples[key]

        sample_values = []
        otu_ids = []
        otu_labels = []
        
        for (sample in sorted_samples) {
            sample_values.push(sorted_samples[sample][0])
            otu_ids.push(sorted_samples[sample][1][0])
            otu_labels.push(sorted_samples[sample][1][1])
        }

        bar_sets[id] = [otu_ids, sample_values, otu_labels];
    }

    init();
});
