$(document).ready(()=>{
    $('.delete-article').click((e)=>{
        const id = $(e.target).attr('data-id');
        
        $.ajax({
            type: 'DELETE',
            url: '/article/' + id,
            success: ()=> { alert('Article Deleting...'); window.location.href= '/'; },
            error: (err) => { console.log(err); }
        });
    });
});